'use strict';

const mongoose = require('mongoose');
const AppError = require('./AppError');

/**
 * Gestore errori del punto C. Viene agganciato in fondo alle rotte /shelves e /user-books,
 * quindi non dipende dal gestore errori globale degli altri colleghi.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = 'Errore interno del server';
  let details;

  if (err instanceof AppError) {
    ({ statusCode, message, details } = err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Dati non validi';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Valore non valido per il campo "${err.path}"`;
  } else if (err && err.code === 11000) {
    statusCode = 409;
    message = 'Esiste già una risorsa con gli stessi valori';
  } else if (err && err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'JSON non valido';
  } else if (err && err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Payload troppo grande';
  }

  if (statusCode >= 500) console.error(err);

  const body = { error: { message } };
  if (details) body.error.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    body.error.stack = err && err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = { errorHandler };
