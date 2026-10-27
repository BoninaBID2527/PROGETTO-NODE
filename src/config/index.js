import 'dotenv/config';

const required = ['MONGODB_URI'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Variabili d'ambiente mancanti: ${missing.join(', ')}`);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || false,
};

config.isProduction = config.env === 'production';

export default config;
