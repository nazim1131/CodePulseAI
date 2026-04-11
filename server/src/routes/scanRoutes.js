const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../middlewares/auth');
const Repository = require('../models/Repository');
const Scan = require('../models/Scan');
const Review = require('../models/Review');
const rateLimit = require('express-rate-limit');
const planLimits = require('../config/planLimits');

// Services
const redis = require('../lib/redis');
const { getRepoFiles, getFileContent } = require('../services/githubService');
const { analyzeCode } = require('../services/aiService');

const scanLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 500, // unlimited in dev effectively
  message: { message: "Too many scan requests, please try again later." }
});

// GET /api/scan/:scanId — Check scan status and results
router.get('/:scanId', protect, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.scanId);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });

    let review = null;
    if (scan.status === 'completed') {
      review = await Review.findOne({ scanId: scan._id });
    }

    res.json({
      scanId: scan._id,
      status: scan.status,
      score: scan.score,
      issuesFound: scan.issuesFound,
      createdAt: scan.createdAt,
      issues: review?.issues || [],
      error: scan.error || null
    });
  } catch (error) {
    console.error('Scan status error:', error.message);
    res.status(500).json({ message: 'Error fetching scan status' });
  }
});

// POST /api/scan — Create scan and process asynchronously
router.post('/', protect, scanLimit, async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ message: 'owner and repo are required' });
    }

    const fullName = `${owner}/${repo}`;

    // Debug logs
    console.log(`[Scan] User: ${req.user.username} | Plan: ${req.user.plan} | scansUsed: ${req.user.scansUsed}/${req.user.scanLimit}`);

    const userLimit = req.user.scanLimit || planLimits[req.user.plan] || planLimits.free;

    // Enforce plan limits in production only
    if (process.env.NODE_ENV === 'production') {
      if (req.user.scansUsed >= userLimit) {
        return res.status(403).json({ 
          message: `You have reached your ${userLimit} scans/month limit for the ${req.user.plan} plan.`, 
          upgradeRequired: req.user.plan === 'free',
          limit: userLimit
        });
      }
    } else {
      // In development: top up depleted users so scans always work
      if (req.user.scansUsed >= userLimit) {
        console.log(`[Scan] Dev mode — resetting scansUsed for ${req.user.username}`);
        await req.user.constructor.findByIdAndUpdate(req.user._id, { scansUsed: 0 });
        req.user.scansUsed = 0;
      }
    }

    // Upsert repo in DB
    const dbRepo = await Repository.findOneAndUpdate(
      { fullName, userId: req.user._id },
      {
        userId: req.user._id,
        name: repo,
        fullName,
        repoUrl: `https://github.com/${fullName}`
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Increment scan count
    await req.user.constructor.findByIdAndUpdate(req.user._id, { $inc: { scansUsed: 1 } });
    req.user.scansUsed += 1;

    // Create scan record immediately
    const scan = await Scan.create({
      repoId: dbRepo._id,
      status: 'processing'
    });

    // Respond immediately with scanId so frontend can navigate and poll
    res.json({ success: true, scanId: scan._id });

    // Process scan in background
    setImmediate(async () => {
      try {
        // 1. Fetch file tree from GitHub
        const tree = await getRepoFiles(req.user._id, owner, repo);
        const codeFiles = tree
          .filter(t => t.type === 'blob' && /\.(js|ts|tsx|jsx|py|go|css|scss|html|vue|svelte|json)$/.test(t.path))
          .filter(t => !t.path.includes('node_modules') && !t.path.includes('.min.'))
          .slice(0, 15);

        console.log(`[Scan] Fetching ${codeFiles.length} files for ${fullName}:`, codeFiles.map(f => f.path));
        let combinedCode = "";
        for (const f of codeFiles) {
          const content = await getFileContent(req.user._id, owner, repo, f.path);
          combinedCode += `\n\n--- FILE: ${f.path} ---\n${content}`;
        }

        if (!combinedCode.trim()) {
          await Scan.findByIdAndUpdate(scan._id, { 
            status: 'failed', 
            error: 'No scannable code files found in this repository' 
          });
          return;
        }

        // 2. Check Redis cache
        const fileHash = crypto.createHash('md5').update(combinedCode).digest('hex');
        const cacheKey = `scan:${dbRepo._id}:${fileHash}`;
        
        let aiResult;
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            aiResult = typeof cached === 'string' ? JSON.parse(cached) : cached;
            console.log(`[AI Cache HIT] ${cacheKey}`);
          }
        } catch (err) {
          console.warn("Cache check failed:", err.message);
        }

        if (!aiResult) {
          console.log(`[AI Cache MISS] ${cacheKey}`);
          aiResult = await analyzeCode(combinedCode);
          try {
            await redis.setex(cacheKey, 3600, JSON.stringify(aiResult));
          } catch (err) {
            console.warn("Cache write failed:", err.message);
          }
        }

        // 3. Save review
        await Review.create({
          scanId: scan._id,
          repoId: dbRepo._id,
          score: aiResult.score,
          totalBugs: aiResult.totalBugs,
          performanceIssues: aiResult.performanceIssues,
          improvements: aiResult.improvements,
          issues: aiResult.issues
        });

        // 4. Update scan + repo records
        await Scan.findByIdAndUpdate(scan._id, {
          status: 'completed',
          score: aiResult.score,
          issuesFound: aiResult.issues?.length || 0,
          durationMs: Date.now() - new Date(scan.createdAt).getTime()
        });

        await Repository.findByIdAndUpdate(dbRepo._id, {
          lastScan: new Date(),
          score: aiResult.score
        });

        console.log(`[Scan] Completed scan ${scan._id} for ${fullName}`);
      } catch (err) {
        console.error(`[Scan] Failed scan ${scan._id}:`, err.message);
        await Scan.findByIdAndUpdate(scan._id, { status: 'failed', error: err.message });
      }
    });

  } catch (error) {
    console.error('Scan error:', error.message);
    res.status(500).json({ message: 'Failed to create scan' });
  }
});

module.exports = router;
