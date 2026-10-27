const passport = require('../config/passport');

// Protegge una rotta: se il token è valido, l'utente è disponibile in req.user
function requireAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: 'Token mancante, non valido o scaduto' });
    }
    req.user = user;
    next();
  })(req, res, next);
}

module.exports = requireAuth;
