'use strict';

const Joi = require('joi');
const { objectId, paginationQuery } = require('./common.validator');

const name = Joi.string().trim().min(1).max(50);
const description = Joi.string().trim().max(200).allow('');

const createShelfSchema = {
  body: Joi.object({
    name: name.required(),
    description,
  }),
};

const updateShelfSchema = {
  body: Joi.object({ name, description }).min(1),
};

const deleteShelfSchema = {
  query: Joi.object({
    // Scaffale di destinazione dei libri contenuti, se lo scaffale da eliminare non è vuoto.
    moveTo: objectId,
  }),
};

const listShelfBooksSchema = {
  query: Joi.object({ ...paginationQuery }),
};

module.exports = {
  createShelfSchema,
  updateShelfSchema,
  deleteShelfSchema,
  listShelfBooksSchema,
};
