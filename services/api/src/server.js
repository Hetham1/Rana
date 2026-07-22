require('dotenv').config();

const { config } = require('./config');
const { pool } = require('./database');
const { createApp } = require('./app');

const app = createApp();
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Etemad Rana API listening on port ${config.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; closing HTTP and PostgreSQL connections`);
  server.close(async (error) => {
    await pool.end();
    process.exit(error ? 1 : 0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, server };
