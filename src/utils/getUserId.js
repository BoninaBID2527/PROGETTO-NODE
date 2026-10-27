'use strict';

const AppError = require('./AppError');

/**
 * Restituisce l'id dell'utente autenticato (impostato dal middleware di autenticazione del Collega A).
 * Supporta `req.user` come documento Mongoose (id / _id) o come payload JWT (userId / sub).
 */
module.exports = function getUserId(req) {
  const user = req.user;
  const id = user && (user.id || user._id || user.userId || user.sub);
  if (!id) throw new AppError('Utente non autenticato', 401);
  return String(id);
};
