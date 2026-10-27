const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Database usato nei test: di default un MongoDB in memoria, creato e distrutto
// a ogni esecuzione. Impostando MONGO_URI_TEST si può usare un MongoDB esistente.
let memoryServer;

async function connect() {
  let uri = process.env.MONGO_URI_TEST;
  if (!uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }
  await mongoose.connect(uri);
}

async function clear() {
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

async function close() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connect, clear, close };
