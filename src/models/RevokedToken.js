const mongoose = require('mongoose');

// Token invalidati con il logout. Il JWT non ha stato, quindi per "disconnettere"
// un utente si memorizza l'identificativo (jti) del token fino alla sua scadenza.
const revokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  // Indice TTL: MongoDB elimina il documento quando il token sarebbe comunque scaduto
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
