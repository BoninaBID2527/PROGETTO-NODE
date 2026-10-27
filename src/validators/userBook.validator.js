'use strict';

const Joi = require('joi');
const { READING_STATUSES } = require('../utils/constants');
const { objectId, paginationQuery } = require('./common.validator');

const bookSnapshot = Joi.object({
  olKey: Joi.string().trim().min(1).max(100).required(),
  title: Joi.string().trim().min(1).max(500).required(),
  authors: Joi.array().items(Joi.string().trim().max(200)).max(50).default([]),
  firstPublishYear: Joi.number().integer().min(0).max(new Date().getFullYear() + 1).allow(null),
  pageCount: Joi.number().integer().min(1).max(100000).allow(null),
  subjects: Joi.array().items(Joi.string().trim().max(200)).max(30).default([]),
  coverUrl: Joi.string().trim().uri({ scheme: ['https', 'http'] }).max(500).allow(null),
});

const addBookSchema = {
  body: Joi.object({
    shelfId: objectId.required(),
    book: bookSnapshot.required(),
  }),
};

const listUserBooksSchema = {
  query: Joi.object({
    shelf: objectId,
    status: Joi.string().valid(...READING_STATUSES),
    ...paginationQuery,
  }),
};

const moveBookSchema = {
  body: Joi.object({
    shelfId: objectId.required(),
  }),
};

const setStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid(...READING_STATUSES)
      .required(),
  }),
};

const progressSchema = {
  body: Joi.object({
    currentPage: Joi.number().integer().min(0).required(),
  }),
};

const reviewSchema = {
  body: Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    review: Joi.string().trim().max(5000).allow(''),
  }).or('rating', 'review'),
};

module.exports = {
  addBookSchema,
  listUserBooksSchema,
  moveBookSchema,
  setStatusSchema,
  progressSchema,
  reviewSchema,
};
