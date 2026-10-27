'use strict';

const mongoose = require('mongoose');
const { READING_STATUSES } = require('../utils/constants');

const shelfSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Il nome dello scaffale è obbligatorio'],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    // Nome normalizzato (minuscolo): garantisce l'unicità per utente senza distinguere maiuscole/minuscole.
    nameKey: { type: String, required: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    // Stato di lettura associato (solo scaffali di default); null per quelli personalizzati.
    status: { type: String, enum: [...READING_STATUSES, null], default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

shelfSchema.index({ user: 1, nameKey: 1 }, { unique: true });
shelfSchema.index({ user: 1, status: 1 });

shelfSchema.pre('validate', function setNameKey(next) {
  if (this.name) this.nameKey = this.name.trim().toLowerCase();
  next();
});

module.exports = mongoose.models.Shelf || mongoose.model('Shelf', shelfSchema);
