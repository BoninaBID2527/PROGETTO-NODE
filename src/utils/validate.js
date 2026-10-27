'use strict';

const AppError = require('./AppError');

/**
 * Valida (e normalizza) params, query e body con schemi Joi.
 * I campi non previsti dallo schema vengono rimossi (stripUnknown).
 *
 * @param {{params?: import('joi').Schema, query?: import('joi').Schema, body?: import('joi').Schema}} schemas
 */
const validate = (schemas) => (req, _res, next) => {
  for (const part of ['params', 'query', 'body']) {
    const schema = schemas[part];
    if (!schema) continue;

    const { value, error } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new AppError('Dati non validi', 400, details));
    }

    req[part] = value;
  }
  next();
};

module.exports = validate;
