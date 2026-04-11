const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Scan = require('../models/Scan');
const Repository = require('../models/Repository');

// GET /api/stats
// Returns real stats for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;

    // Get all repos belonging to this user
    const userRepos = await Repository.find({ userId: user._id }).select('_id');
    const repoIds = userRepos.map(r => r._id);

    if (repoIds.length === 0) {
      return res.json({ totalBugs: 0, avgScore: 0, totalScans: 0 });
    }

    // Aggregate stats from scans
    const [result] = await Scan.aggregate([
      { $match: { repoId: { $in: repoIds }, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalBugs: { $sum: '$issuesFound' },
          avgScore: { $avg: '$score' },
          totalScans: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalBugs: result?.totalBugs || 0,
      avgScore: result?.avgScore ? Math.round(result.avgScore) : 0,
      totalScans: result?.totalScans || 0
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
