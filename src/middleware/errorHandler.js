// Rotta non trovata
function notFound(req, res) {
  res.status(404).json({ message: `Risorsa non trovata: ${req.method} ${req.originalUrl}` });
}

// Gestione centralizzata degli errori: trasforma ogni errore in una risposta JSON.
// Express riconosce un middleware di errore dai 4 parametri, quindi "next" va dichiarato.
function errorHandler(err, req, res, next) {
  // Errori di validazione dello schema Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Dati non validi', errors });
  }

  // Id non valido (es. /api/library/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Valore non valido per ${err.path}` });
  }

  // Violazione di un indice unico (es. email già registrata)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ message: `Valore già esistente: ${field}` });
  }

  // Body JSON malformato
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON non valido' });
  }

  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ message: status === 500 ? 'Errore interno del server' : err.message });
}

module.exports = { notFound, errorHandler };
