'use strict';

const asyncHandler = require('../utils/asyncHandler');
const getUserId = require('../utils/getUserId');
const shelfService = require('../services/shelf.service');

const list = asyncHandler(async (req, res) => {
  const data = await shelfService.listShelves(getUserId(req));
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await shelfService.createShelf(getUserId(req), req.body);
  res.status(201).json({ data });
});

const getOne = asyncHandler(async (req, res) => {
  const { shelf, books, meta } = await shelfService.getShelfWithBooks(
    getUserId(req),
    req.params.id,
    req.query,
  );
  res.json({ data: { ...shelf.toJSON(), books }, meta });
});

const update = asyncHandler(async (req, res) => {
  const data = await shelfService.updateShelf(getUserId(req), req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  const result = await shelfService.deleteShelf(getUserId(req), req.params.id, req.query);
  res.json({ data: result });
});

module.exports = { list, create, getOne, update, remove };
