const express = require('express');
const crypto = require('crypto');
const Repository = require('../models/Repository');
const Scan = require('../models/Scan');
const Review = require('../models/Review');
const redis = require('../lib/redis');
const { getRepoFiles, getFileContent } = require('../services/githubService');
const { analyzeCode } = require('../services/aiService');

const router = express.Router();

// Verify github webhook signature
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !process.env.WEBHOOK_SECRET) return next();

  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  if (signature !== digest) {
    return res.status(401).send('Signature mismatch');
  }
  next();
};

const processWebhookScan = async (repo, owner, repoName) => {
  try {
    const scan = await Scan.create({
      repoId: repo._id,
      status: 'processing'
    });

    const tree = await getRepoFiles(repo.userId, owner, repoName);
    const codeFiles = tree.filter(t => t.type === 'blob' && (t.path.endsWith('.js') || t.path.endsWith('.ts') || t.path.endsWith('.tsx'))).slice(0, 5);
    
    let combinedCode = "";
    for (const f of codeFiles) {
      const content = await getFileContent(repo.userId, owner, repoName, f.path);
      combinedCode += `\n\n--- FILE: ${f.path} ---\n${content}`;
    }

    const fileHash = crypto.createHash('md5').update(combinedCode).digest('hex');
    const cacheKey = `scan:${repo._id}:${fileHash}`;
    
    let aiResult;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        aiResult = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      }
    } catch (err) {
      console.warn("Redis check failed", err);
    }

    if (!aiResult) {
      aiResult = await analyzeCode(combinedCode);
      try {
        await redis.setex(cacheKey, 3600, JSON.stringify(aiResult));
      } catch (err) {
        console.warn("Redis set failed", err);
      }
    }

    await Review.create({
      scanId: scan._id,
      repoId: repo._id,
      score: aiResult.score,
      totalBugs: aiResult.totalBugs,
      performanceIssues: aiResult.performanceIssues,
      improvements: aiResult.improvements,
      issues: aiResult.issues
    });

    await Scan.findByIdAndUpdate(scan._id, { 
      status: 'completed', 
      score: aiResult.score,
      issuesFound: aiResult.issues?.length || 0,
      durationMs: 5000 
    });
    
    await Repository.findByIdAndUpdate(repo._id, {
      lastScan: new Date(),
      score: aiResult.score
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};

// POST /api/webhooks/github
router.post('/github', verifySignature, async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  try {
    if (event === 'push' || event === 'pull_request') {
      const gitRepoId = payload.repository.id.toString();
      const repoName = payload.repository.name;
      const owner = payload.repository.owner.login;

      // Find if we are tracking this repo
      const repo = await Repository.findOne({ githubRepoId: gitRepoId });
      if (repo) {
        // Run synchronously but do not block response for webhook timeout
        processWebhookScan(repo, owner, repoName);
      }
    }
    res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
