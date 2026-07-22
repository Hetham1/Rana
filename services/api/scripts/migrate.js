require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../src/database');

async function migrate() {
  const migrationsDirectory = path.join(__dirname, '..', 'migrations');
  const filenames = (await fs.readdir(migrationsDirectory))
    .filter((filename) => /^\d+.*\.sql$/.test(filename) && !filename.includes('seed'))
    .sort();

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const filename of filenames) {
      const existing = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [filename],
      );
      if (existing.rowCount > 0) continue;

      const sql = await fs.readFile(path.join(migrationsDirectory, filename), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`Applied ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed', error);
  process.exitCode = 1;
});
