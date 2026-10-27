'use strict';

const mongoose = require('mongoose');
const Shelf = require('../models/Shelf');
const UserBook = require('../models/UserBook');
const { DEFAULT_SHELVES } = require('../utils/constants');
const AppError = require('../utils/AppError');
const { buildMeta } = require('../utils/pagination');

const isDuplicateKey = (err) =>
  (err && err.code === 11000) ||
  (err && Array.isArray(err.writeErrors) && err.writeErrors.every((w) => w.err && w.err.code === 11000));

/**
 * Crea (se mancano) gli scaffali di default dell'utente. Idempotente e sicuro in caso di richieste concorrenti.
 * Da chiamare anche subito dopo la registrazione (Collega A).
 */
async function ensureDefaultShelves(userId) {
  const existing = await Shelf.countDocuments({ user: userId, isDefault: true });
  if (existing >= DEFAULT_SHELVES.length) return;

  const ops = DEFAULT_SHELVES.map(({ name, status }) => ({
    updateOne: {
      filter: { user: userId, nameKey: name.toLowerCase() },
      update: {
        $setOnInsert: { user: userId, name, nameKey: name.toLowerCase(), status, isDefault: true },
      },
      upsert: true,
    },
  }));

  try {
    await Shelf.bulkWrite(ops, { ordered: false });
  } catch (err) {
    // Una richiesta concorrente ha già creato gli scaffali: va bene così.
    if (!isDuplicateKey(err)) throw err;
  }
}

/** Restituisce lo scaffale dell'utente o lancia 404 (anche se esiste ma appartiene ad altri). */
async function getOwnedShelf(userId, shelfId) {
  const shelf = await Shelf.findOne({ _id: shelfId, user: userId });
  if (!shelf) throw new AppError('Scaffale non trovato', 404);
  return shelf;
}

async function listShelves(userId) {
  await ensureDefaultShelves(userId);

  const [shelves, counts] = await Promise.all([
    Shelf.find({ user: userId }).sort({ isDefault: -1, createdAt: 1 }).lean(),
    UserBook.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$shelf', count: { $sum: 1 } } },
    ]),
  ]);

  const countByShelf = new Map(counts.map((c) => [String(c._id), c.count]));
  return shelves.map((s) => ({ ...s, booksCount: countByShelf.get(String(s._id)) || 0 }));
}

async function createShelf(userId, { name, description }) {
  try {
    return await Shelf.create({ user: userId, name, description });
  } catch (err) {
    if (isDuplicateKey(err)) throw new AppError('Esiste già uno scaffale con questo nome', 409);
    throw err;
  }
}

async function getShelfWithBooks(userId, shelfId, { page, limit }) {
  const shelf = await getOwnedShelf(userId, shelfId);
  const filter = { user: userId, shelf: shelf._id };

  const [books, total] = await Promise.all([
    UserBook.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    UserBook.countDocuments(filter),
  ]);

  return { shelf, books, meta: buildMeta({ page, limit, total }) };
}

async function updateShelf(userId, shelfId, changes) {
  const shelf = await getOwnedShelf(userId, shelfId);
  if (shelf.isDefault) {
    throw new AppError('Gli scaffali di default non possono essere modificati', 403);
  }

  if (changes.name !== undefined) shelf.name = changes.name;
  if (changes.description !== undefined) shelf.description = changes.description;

  try {
    return await shelf.save();
  } catch (err) {
    if (isDuplicateKey(err)) throw new AppError('Esiste già uno scaffale con questo nome', 409);
    throw err;
  }
}

/**
 * Elimina uno scaffale personalizzato.
 * Se contiene libri serve `moveTo` (scaffale di destinazione), altrimenti 409:
 * così non si perdono libri per errore.
 */
async function deleteShelf(userId, shelfId, { moveTo } = {}) {
  const shelf = await getOwnedShelf(userId, shelfId);
  if (shelf.isDefault) {
    throw new AppError('Gli scaffali di default non possono essere eliminati', 403);
  }

  const booksCount = await UserBook.countDocuments({ user: userId, shelf: shelf._id });

  if (booksCount > 0) {
    if (!moveTo) {
      throw new AppError(
        `Lo scaffale contiene ${booksCount} libri: indica "moveTo" con lo scaffale di destinazione`,
        409,
      );
    }
    if (String(moveTo) === String(shelf._id)) {
      throw new AppError('Lo scaffale di destinazione deve essere diverso da quello eliminato', 400);
    }

    const target = await getOwnedShelf(userId, moveTo);
    const update = { shelf: target._id };
    if (target.status) update.status = target.status;

    await UserBook.updateMany({ user: userId, shelf: shelf._id }, { $set: update });
  }

  await shelf.deleteOne();
  return { movedBooks: booksCount };
}

module.exports = {
  ensureDefaultShelves,
  getOwnedShelf,
  listShelves,
  createShelf,
  getShelfWithBooks,
  updateShelf,
  deleteShelf,
};
