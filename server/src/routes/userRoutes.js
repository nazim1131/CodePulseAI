const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// GET /api/user/subscription
// Returns current user's subscription details
router.get('/subscription', protect, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      plan: user.plan || 'free',
      scanLimit: user.scanLimit || 50,
      scansUsed: user.scansUsed || 0,
      subscriptionStatus: user.subscriptionId ? 'active' : 'active'
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
