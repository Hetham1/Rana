process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { createApp } = require('../src/app');

function createDatabaseStub() {
  return {
    async query(sql) {
      if (sql === 'SELECT 1') return { rows: [{ '?column?': 1 }], rowCount: 1 };
      throw new Error(`Unexpected test query: ${sql}`);
    },
  };
}

test('GET /health exposes a liveness check without database access', async () => {
  const response = await request(createApp({ database: createDatabaseStub() })).get('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', service: 'etemad-rana-api' });
});

test('GET /ready verifies database connectivity', async () => {
  const response = await request(createApp({ database: createDatabaseStub() })).get('/ready');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ready' });
});

test('protected endpoints reject missing credentials', async () => {
  const response = await request(createApp({ database: createDatabaseStub() })).get('/api/v1/users');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('management reports reject an authenticated operator role', async () => {
  const token = jwt.sign(
    { sub: 'usr_operator', username: 'operator', role: 'operator', workplaceId: 'wp1' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '5m' },
  );
  const response = await request(createApp({ database: createDatabaseStub() }))
    .get('/api/v1/adminreport/summary')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
});

test('unknown endpoints use the shared error envelope', async () => {
  const response = await request(createApp({ database: createDatabaseStub() })).get('/missing');
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});
