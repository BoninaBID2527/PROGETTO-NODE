'use strict';

/**
 * Inoltra automaticamente gli errori dei controller async a next().
 */
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
