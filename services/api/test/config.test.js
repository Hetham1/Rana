const { spawnSync } = require('child_process');
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('production rejects the development database connection default', () => {
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      "process.env.NODE_ENV='production'; process.env.JWT_SECRET='x'.repeat(32); delete process.env.DATABASE_URL; require('./src/config');",
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DATABASE_URL must be explicitly configured in production/);
});
