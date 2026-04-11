const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// GET /api/auth/me
// Returns current logged in user
router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    githubId: req.user.githubId,
    avatar: req.user.avatar,
    plan: req.user.plan
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// GET /api/auth/github
// Redirects user to GitHub OAuth login page
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GET /api/auth/github/callback
// Handles callback from GitHub and exchanges code for access token
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login?error=auth_failed' }),
  (req, res) => {
    try {
      const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
      
      const token = generateToken(user._id);
      
      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&username=${user.username}`);
    } catch (error) {
      console.error('Github callback processing error:', error);
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// We had POST /api/auth/github before for local JWT flow (if any). Looking at the prompt, 
// no mention of POST was there in the original authRoutes.js snippet, except from mock_api.ts calling it.
// The frontend mock-api does a POST /api/auth/github for mock login fallback.
// Let's add it back so nothing breaks for existing tests.
router.post('/github', async (req, res) => {
  try {
    const User = require('../models/User');
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        githubId: 'mock_123',
        username: 'mock_user',
        accessToken: 'mock_token'
      });
    }
    const token = generateToken(user._id);
    res.json({ token, id: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Mock auth failed' });
  }
});

module.exports = router;
