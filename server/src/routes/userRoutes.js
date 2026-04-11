const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// GET /api/user/subscription
// Returns current user's subscription details
router.get('/subscription', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate derived fields
    const scanLimit = user.scansTotal || 50;
    const scansRemaining = user.scansRemaining || Number(user.scansRemaining) === 0 ? user.scansRemaining : 50;
    const scansUsed = scanLimit - scansRemaining;
    
    res.json({
      plan: user.plan || 'free',
      scanLimit: scanLimit,
      scansUsed: scansUsed,
      subscriptionStatus: user.stripeSubscriptionId ? 'active' : 'active'
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
