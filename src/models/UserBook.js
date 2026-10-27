'use strict';

const mongoose = require('mongoose');
const { READING_STATUSES } = require('../utils/constants');

/**
 * Snapshot dei dati del libro (provenienti da Open Library, punto B) salvato insieme
 * al record personale: evita di chiamare l'API esterna ogni volta che si mostra lo scaffale.
 */
const bookSnapshotSchema = new mongoose.Schema(
  {
    olKey: { type: String, required: true, trim: true, maxlength: 100 },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    authors: { type: [String], default: [] },
    firstPublishYear: { type: Number, default: null },
    pageCount: { type: Number, min: 1, default: null },
    subjects: { type: [String], default: [] },
    coverUrl: { type: String, trim: true, maxlength: 500, default: null },
  },
  { _id: false },
);

const userBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shelf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelf',
      required: true,
    },
    book: { type: bookSnapshotSchema, required: true },
    status: { type: String, enum: READING_STATUSES, default: 'to_read' },
    currentPage: { type: Number, min: 0, default: 0, validate: Number.isInteger },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
      validate: {
        validator: (v) => v === null || Number.isInteger(v),
        message: 'La valutazione deve essere un numero intero da 1 a 5',
      },
    },
    review: { type: String, trim: true, maxlength: 5000, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Un libro può essere salvato una sola volta per utente.
userBookSchema.index({ user: 1, 'book.olKey': 1 }, { unique: true });
userBookSchema.index({ user: 1, shelf: 1, createdAt: -1 });
userBookSchema.index({ user: 1, status: 1, createdAt: -1 });

/**
 * Percentuale di avanzamento (0-100):
 *  - "letto" -> 100, "da leggere" -> 0
 *  - "in lettura" -> currentPage / pageCount (null se il numero di pagine non è noto)
 */
userBookSchema.virtual('progressPercent').get(function progressPercent() {
  if (this.status === 'read') return 100;
  if (this.status === 'to_read') return 0;
  const total = this.book && this.book.pageCount;
  if (!total) return null;
  return Math.min(100, Math.round((this.currentPage / total) * 100));
});

userBookSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.id; // già presente come _id
    return ret;
  },
});

module.exports = mongoose.models.UserBook || mongoose.model('UserBook', userBookSchema);
