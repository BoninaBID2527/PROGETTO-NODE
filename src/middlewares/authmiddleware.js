// =============================================================================
//  COLLEGA A — Autenticazione (Passport.js + JWT Bearer Token)
// =============================================================================
import AppError from '../utils/AppError.js';

export const authenticate = (_req, _res, next) =>
  next(new AppError('Autenticazione non ancora implementata (TODO Collega A)', 501));
