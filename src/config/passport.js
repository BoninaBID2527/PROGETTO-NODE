const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');

// Strategia JWT: il token viene letto dall'header "Authorization: Bearer <token>"
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      // Un token usato per il logout non è più valido
      if (await RevokedToken.exists({ jti: payload.jti })) {
        return done(null, false);
      }

      // payload.sub contiene l'id dell'utente, inserito al momento del login
      const user = await User.findById(payload.sub);
      if (!user) return done(null, false);

      // Il terzo argomento (payload) serve al logout per conoscere jti e scadenza
      return done(null, user, payload);
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
