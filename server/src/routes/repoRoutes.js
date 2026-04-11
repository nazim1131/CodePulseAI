const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Repository = require('../models/Repository');
const Scan = require('../models/Scan');
const Review = require('../models/Review');

// GET /api/repos
// Fetch repos for the user from GitHub API (live data)
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;

    // Debug: log token presence
    console.log("ACCESS TOKEN:", user.accessToken ? `${user.accessToken.substring(0, 8)}...` : "MISSING");

    if (!user.accessToken) {
      return res.status(400).json({ 
        message: 'GitHub access token not found. Please re-login with GitHub.',
        repos: []
      });
    }

    // Fetch from GitHub API using Bearer auth
    const githubRes = await axios.get('https://api.github.com/user/repos', {
      headers: { 
        Authorization: `Bearer ${user.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100,
        sort: 'updated',
        type: 'all'
      }
    });

    // Sync repos to DB and return formatted data
    const formatted = [];
    for (const r of githubRes.data) {
      // Upsert in DB
      await Repository.findOneAndUpdate(
        { githubRepoId: r.id.toString(), userId: user._id },
        {
          userId: user._id,
          githubRepoId: r.id.toString(),
          name: r.name,
          fullName: r.full_name,
          repoUrl: r.html_url,
          language: r.language
        },
        { upsert: true, new: true }
      );

      formatted.push({
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        html_url: r.html_url,
        stargazers_count: r.stargazers_count,
        language: r.language
      });
    }

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching repos:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching repos from GitHub' });
  }
});

// GET /api/repos/:id
router.get('/:id', protect, async (req, res) => {
  try {
    // try object id or old string id
    let repo = await Repository.findById(req.params.id);
    if (!repo) repo = await Repository.findOne({ githubRepoId: req.params.id });
    
    if (!repo) return res.status(404).json({ message: 'Repo not found' });
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repo details' });
  }
});

module.exports = router;
