'use strict';

const Joi = require('joi');
const { DEFAULT_LIMIT, MAX_LIMIT } = require('../utils/pagination');

const objectId = Joi.string().hex().length(24);

const idParams = Joi.object({
  id: objectId.required(),
});

const paginationQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
};

module.exports = { objectId, idParams, paginationQuery };
