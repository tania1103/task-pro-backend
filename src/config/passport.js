const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL, // direct, fără SERVER_URL dacă ai această variabilă
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        name: profile.displayName || 'Google User',
        email: profile.emails?.[0]?.value,
        googleId: profile.id,
        isEmailVerified: true,
        profileImage: profile.photos?.[0]?.value
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;
