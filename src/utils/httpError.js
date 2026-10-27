// Crea un errore con un codice HTTP, gestito poi da errorHandler
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = httpError;
