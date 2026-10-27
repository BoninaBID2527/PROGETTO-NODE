'use strict';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

module.exports = { DEFAULT_LIMIT, MAX_LIMIT, buildMeta };
