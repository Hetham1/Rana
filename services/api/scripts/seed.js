require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { config } = require('../src/config');
const { pool } = require('../src/database');

async function seed() {
  if (config.environment === 'production') {
    throw new Error('Development seed data cannot be loaded in production');
  }

  const migrationsDirectory = path.join(__dirname, '..', 'migrations');
  const seedFiles = (await fs.readdir(migrationsDirectory))
    .filter((filename) => /^\d+_seed_.*\.sql$/.test(filename))
    .sort();

  for (const filename of seedFiles) {
    const sql = await fs.readFile(path.join(migrationsDirectory, filename), 'utf8');
    await pool.query(sql);
    console.log(`Loaded ${filename}`);
  }
  await pool.end();
}

seed().catch((error) => {
  console.error('Seeding failed', error);
  process.exitCode = 1;
});
