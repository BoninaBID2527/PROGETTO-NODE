'use strict';

/**
 * Errore "operativo" con status HTTP, gestito da errorMiddleware.js.
 */
class AppError extends Error {
  /**
   * @param {string} message messaggio per il client
   * @param {number} statusCode status HTTP
   * @param {Array<{field: string, message: string}>} [details] dettagli (es. errori di validazione)
   */
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
