'use strict';

const asyncHandler = require('../utils/asyncHandler');
const getUserId = require('../utils/getUserId');
const userBookService = require('../services/userBook.service');

const add = asyncHandler(async (req, res) => {
  const data = await userBookService.addBookToShelf(getUserId(req), req.body);
  res.status(201).json({ data });
});

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await userBookService.listUserBooks(getUserId(req), req.query);
  res.json({ data: items, meta });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await userBookService.getUserBook(getUserId(req), req.params.id);
  res.json({ data });
});

const move = asyncHandler(async (req, res) => {
  const data = await userBookService.moveToShelf(getUserId(req), req.params.id, req.body.shelfId);
  res.json({ data });
});

const changeStatus = asyncHandler(async (req, res) => {
  const data = await userBookService.setStatus(getUserId(req), req.params.id, req.body.status);
  res.json({ data });
});

const updateProgress = asyncHandler(async (req, res) => {
  const data = await userBookService.updateProgress(
    getUserId(req),
    req.params.id,
    req.body.currentPage,
  );
  res.json({ data });
});

const saveReview = asyncHandler(async (req, res) => {
  const data = await userBookService.saveReview(getUserId(req), req.params.id, req.body);
  res.json({ data });
});

const removeReview = asyncHandler(async (req, res) => {
  const data = await userBookService.removeReview(getUserId(req), req.params.id);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  await userBookService.removeUserBook(getUserId(req), req.params.id);
  res.status(204).send();
});

module.exports = {
  add,
  list,
  getOne,
  move,
  changeStatus,
  updateProgress,
  saveReview,
  removeReview,
  remove,
};
