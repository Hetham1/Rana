const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/async-handler');
const { validate } = require('../middleware/validate');

const workplaceIdSchema = z.object({ wpId: z.string().trim().min(1).max(100) });
const workplaceNameSchema = z.object({ wpName: z.string().trim().min(1).max(200) });

function createCatalogRouter(database) {
  const router = Router();

  router.get('/prod/name', asyncHandler(async (_request, response) => {
    const result = await database.query('SELECT id AS "prodId", name AS "prodName" FROM products ORDER BY name');
    response.json({ success: true, data: result.rows });
  }));

  router.get('/workplace/reverse/:wpName', validate('params', workplaceNameSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT id AS "wpId", name AS "wpName", type AS "wpType", address AS "wpAddress", phone_number AS "wpPhoneNumber"
       FROM workplaces WHERE name = $1`,
      [request.params.wpName],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/workplace/:wpId', validate('params', workplaceIdSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT name AS "wpName", type AS "wpType", address AS "wpAddress", phone_number AS "wpPhoneNumber"
       FROM workplaces WHERE id = $1`,
      [request.params.wpId],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/workplace', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT id AS "wpId", name AS "wpName", type AS "wpType", address AS "wpAddress", phone_number AS "wpPhoneNumber"
       FROM workplaces ORDER BY name`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/pp', asyncHandler(async (_request, response) => {
    const result = await database.query('SELECT id AS "ppId" FROM production_plans ORDER BY manufactured_at DESC');
    response.json({ success: true, data: result.rows });
  }));

  router.get('/manf/name', asyncHandler(async (_request, response) => {
    const result = await database.query('SELECT name AS "manfName" FROM manufacturers ORDER BY name');
    response.json({ success: true, data: result.rows });
  }));

  router.get('/prod/highdemand', asyncHandler(async (_request, response) => {
    const result = await database.query('SELECT name AS "prodName" FROM products WHERE is_high_demand = true ORDER BY name');
    response.json({ success: true, data: result.rows });
  }));

  router.get('/users', asyncHandler(async (_request, response) => {
    const result = await database.query(
      'SELECT id AS "userId", full_name AS "fullName", username FROM users WHERE is_active = true ORDER BY full_name',
    );
    response.json({ success: true, data: result.rows });
  }));

  return router;
}

module.exports = { createCatalogRouter };
