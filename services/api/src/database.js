const { Pool } = require('pg');
const { config } = require('./config');

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: config.databaseSsl ? { rejectUnauthorized: true } : false,
});

pool.on('error', (error) => {
  // A failed idle client must be observed so Node does not terminate silently.
  console.error('Unexpected PostgreSQL pool error', error);
});

/**
 * Runs a unit of work in a PostgreSQL transaction.
 * @param {(client: import('pg').PoolClient) => Promise<unknown>} work transaction callback
 * @returns {Promise<unknown>} callback result
 * @throws {Error} original database or callback error after rollback
 */
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query: (...args) => pool.query(...args), withTransaction };
