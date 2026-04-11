const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Review = require('../models/Review');
const Scan = require('../models/Scan');

// GET /api/reviews/:repoId
router.get('/:repoId', protect, async (req, res) => {
  try {
    // Get latest completed scan
    const latestScan = await Scan.findOne({ repoId: req.params.repoId, status: 'completed' }).sort({ createdAt: -1 });
    if (!latestScan) return res.json({ issues: [] });

    const review = await Review.findOne({ scanId: latestScan._id });
    if (!review) return res.json({ issues: [] });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/history/:repoId
router.get('/history/:repoId', protect, async (req, res) => {
  try {
    const scans = await Scan.find({ repoId: req.params.repoId }).sort({ createdAt: -1 });
    
    const mapped = scans.map(s => ({
      id: s._id,
      repoId: s.repoId,
      date: s.createdAt,
      score: s.score || 0,
      issuesFound: s.issuesFound || 0,
      duration: s.durationMs ? `${(s.durationMs / 1000).toFixed(1)}s` : '-'
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/report/:repoId
router.get('/report/:repoId', protect, async (req, res) => {
  try {
    const repoScans = await Scan.find({ repoId: req.params.repoId, status: 'completed' }).sort({ createdAt: 1 });
    
    if (!repoScans.length) {
      return res.json({
        score: 0, totalBugs: 0, performanceIssues: 0, improvements: 0, trend: []
      });
    }

    const latest = repoScans[repoScans.length - 1];
    const latestReview = await Review.findOne({ scanId: latest._id });

    res.json({
      score: latest.score,
      totalBugs: latestReview ? latestReview.totalBugs : 0,
      performanceIssues: latestReview ? latestReview.performanceIssues : 0,
      improvements: latestReview ? latestReview.improvements : 0,
      trend: repoScans.map(s => s.score || 0)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
