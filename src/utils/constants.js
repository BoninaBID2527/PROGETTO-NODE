'use strict';

const READING_STATUSES = Object.freeze(['to_read', 'reading', 'read']);

/**
 * Scaffali creati automaticamente per ogni utente.
 * `status` lega lo scaffale allo stato di lettura: spostare un libro in questi scaffali
 * ne aggiorna lo stato.
 */
const DEFAULT_SHELVES = Object.freeze([
  { name: 'Da leggere', status: 'to_read' },
  { name: 'In lettura', status: 'reading' },
  { name: 'Letti', status: 'read' },
]);

module.exports = { READING_STATUSES, DEFAULT_SHELVES };
