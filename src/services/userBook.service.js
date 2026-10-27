'use strict';

const Shelf = require('../models/Shelf');
const UserBook = require('../models/UserBook');
const AppError = require('../utils/AppError');
const { buildMeta } = require('../utils/pagination');
const { ensureDefaultShelves, getOwnedShelf } = require('./shelf.service');

async function getOwnedUserBook(userId, userBookId) {
  const userBook = await UserBook.findOne({ _id: userBookId, user: userId });
  if (!userBook) throw new AppError('Libro non trovato', 404);
  return userBook;
}

/**
 * Salva un libro (snapshot Open Library) in uno scaffale dell'utente.
 * Lo stato iniziale è quello dello scaffale (se di default) oppure "da leggere".
 */
async function addBookToShelf(userId, { shelfId, book }) {
  const shelf = await getOwnedShelf(userId, shelfId);

  try {
    return await UserBook.create({
      user: userId,
      shelf: shelf._id,
      book,
      status: shelf.status || 'to_read',
    });
  } catch (err) {
    if (err && err.code === 11000) throw new AppError('Hai già salvato questo libro', 409);
    throw err;
  }
}

async function listUserBooks(userId, { shelf, status, page, limit }) {
  const filter = { user: userId };
  if (shelf) filter.shelf = shelf;
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    UserBook.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    UserBook.countDocuments(filter),
  ]);

  return { items, meta: buildMeta({ page, limit, total }) };
}

const getUserBook = getOwnedUserBook;

/**
 * Sposta il libro in un altro scaffale.
 * Se lo scaffale di destinazione è uno di default, lo stato di lettura si allinea.
 */
async function moveToShelf(userId, userBookId, shelfId) {
  const userBook = await getOwnedUserBook(userId, userBookId);
  const target = await getOwnedShelf(userId, shelfId);

  userBook.shelf = target._id;
  if (target.status) userBook.status = target.status;

  return userBook.save();
}

/**
 * Cambia lo stato di lettura. Se il libro si trova in uno scaffale di default,
 * viene spostato nello scaffale di default corrispondente al nuovo stato;
 * se è in uno scaffale personalizzato resta dov'è.
 */
async function setStatus(userId, userBookId, status) {
  const userBook = await getOwnedUserBook(userId, userBookId);
  const currentShelf = await Shelf.findOne({ _id: userBook.shelf, user: userId });

  if (currentShelf && currentShelf.status && currentShelf.status !== status) {
    await ensureDefaultShelves(userId);
    const targetShelf = await Shelf.findOne({ user: userId, status, isDefault: true });
    if (targetShelf) userBook.shelf = targetShelf._id;
  }

  userBook.status = status;
  return userBook.save();
}

/** Aggiorna la pagina corrente (solo per i libri "in lettura"). */
async function updateProgress(userId, userBookId, currentPage) {
  const userBook = await getOwnedUserBook(userId, userBookId);

  if (userBook.status !== 'reading') {
    throw new AppError('Il progresso si può aggiornare solo per i libri "in lettura"', 409);
  }

  const total = userBook.book.pageCount;
  if (total && currentPage > total) {
    throw new AppError(`La pagina corrente non può superare il totale (${total})`, 400);
  }

  userBook.currentPage = currentPage;
  return userBook.save();
}

/** Crea o aggiorna valutazione (1-5) e/o recensione. I campi omessi restano invariati. */
async function saveReview(userId, userBookId, { rating, review }) {
  const userBook = await getOwnedUserBook(userId, userBookId);

  if (rating !== undefined) userBook.rating = rating;
  if (review !== undefined) userBook.review = review;
  userBook.reviewedAt = new Date();

  return userBook.save();
}

async function removeReview(userId, userBookId) {
  const userBook = await getOwnedUserBook(userId, userBookId);

  userBook.rating = null;
  userBook.review = '';
  userBook.reviewedAt = null;

  return userBook.save();
}

async function removeUserBook(userId, userBookId) {
  const userBook = await getOwnedUserBook(userId, userBookId);
  await userBook.deleteOne();
}

module.exports = {
  addBookToShelf,
  listUserBooks,
  getUserBook,
  moveToShelf,
  setStatus,
  updateProgress,
  saveReview,
  removeReview,
  removeUserBook,
};
