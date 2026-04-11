const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ githubId: profile.id.toString() });
      if (user) {
        user.accessToken = accessToken;
        if (profile.username) user.username = profile.username;
        if (profile.photos && profile.photos.length > 0) user.avatar = profile.photos[0].value;
        await user.save();
        return done(null, user);
      } else {
        user = await User.create({
          githubId: profile.id.toString(),
          username: profile.username || profile.displayName || `user_${profile.id}`,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          accessToken
        });
        return done(null, user);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
