import app from './app.js';
import config from './config/index.js';
import { connectDB, disconnectDB } from './config/db.js';

async function start() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`BookTrack in ascolto sulla porta ${config.port} (${config.env})`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} ricevuto, chiusura in corso...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

start().catch((err) => {
  console.error('Avvio fallito:', err);
  process.exit(1);
});
