require('dotenv').config({ quiet: true });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Variabili MONGO_URI e JWT_SECRET obbligatorie: copia .env.example in .env');
  process.exit(1);
}

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Connessione a MongoDB fallita:', err.message);
    process.exit(1);
  });
