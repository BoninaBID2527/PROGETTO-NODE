const mongoose = require('mongoose');

async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log('Connesso a MongoDB');
}

module.exports = connectDB;
