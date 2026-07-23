const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/async-handler');
const { authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { conflict, notFound } = require('../errors');

const orderParamsSchema = z.object({ orderId: z.string().trim().min(1).max(100) });
const transportSchema = z.object({
  orderId: z.string().trim().min(1).max(100),
  tpDriverName: z.string().trim().min(1).max(500),
  driverPhone: z.string().trim().max(50).optional(),
  driverLicense: z.string().trim().max(100).optional(),
});

const orderSelect = `
  o.id AS "ordId",
  o.ordered_at AS "orderDate",
  o.customer_id AS "custId",
  o.is_approved AS "orderApproval",
  o.situation AS "orderSituation"
`;

function createOrdersRouter(database) {
  const router = Router();

  router.get('/order', authorize('admin', 'operator'), asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT o.id AS "ordId", o.situation AS "orderSituation", o.ordered_at AS "orderDate", c.name AS "custName"
       FROM orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.is_approved = true
       ORDER BY o.ordered_at DESC`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/orderDetails/:orderId', authorize('admin', 'operator', 'security'), validate('params', orderParamsSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT p.id AS "prodId", p.name AS "prodName", oi.quantity AS "contCount"
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1 ORDER BY p.name`,
      [request.params.orderId],
    );
    response.json({ success: true, data: result.rowCount === 0 ? 'no' : result.rows });
  }));

  router.get('/gatheredexit', authorize('admin', 'security'), asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT ${orderSelect}, c.name AS "custName"
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE lower(o.situation) = 'gathered'
       ORDER BY o.ordered_at`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/fporder/:orderId', authorize('admin', 'security'), validate('params', orderParamsSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT order_id AS orderid, final_product_id AS "fpId", created_at
       FROM sold_final_products WHERE order_id = $1 ORDER BY created_at`,
      [request.params.orderId],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.put('/ordersc/:orderId', authorize('admin', 'security'), validate('params', orderParamsSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `UPDATE orders SET situation = 'Security Checked'
       WHERE id = $1 AND lower(situation) IN ('gathered', 'submitted')
       RETURNING id`,
      [request.params.orderId],
    );
    if (result.rowCount === 0) throw conflict('سفارش یافت نشد یا امکان تایید حراست در وضعیت فعلی وجود ندارد');
    response.json({ success: true, data: `وضعیت سفارش ${request.params.orderId} به تایید حراست تغییر کرد` });
  }));

  router.get('/ordersc/:orderId', authorize('admin', 'security'), validate('params', orderParamsSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT 1 FROM orders WHERE id = $1 AND lower(situation) = 'security checked'`,
      [request.params.orderId],
    );
    response.json({ success: result.rowCount > 0, data: result.rowCount > 0 ? '1' : '0' });
  }));

  router.post('/transports/new', authorize('admin', 'security'), validate('body', transportSchema), asyncHandler(async (request, response) => {
    const legacyDriverParts = request.body.tpDriverName.split('|').map((part) => part.trim());
    const driverName = legacyDriverParts[0];
    const driverPhone = request.body.driverPhone || legacyDriverParts[1] || null;
    const driverLicense = request.body.driverLicense || legacyDriverParts[2] || null;

    const transport = await database.withTransaction(async (client) => {
      const orderResult = await client.query(
        `SELECT o.id, o.situation, c.address
         FROM orders o JOIN customers c ON c.id = o.customer_id
         WHERE o.id = $1 FOR UPDATE OF o`,
        [request.body.orderId],
      );
      if (orderResult.rowCount === 0) throw notFound('سفارش یافت نشد');
      if (orderResult.rows[0].situation.toLowerCase() !== 'security checked') {
        throw conflict('سفارش هنوز تایید حراست نشده است');
      }

      const inserted = await client.query(
        `INSERT INTO transports
          (order_id, driver_name, driver_phone, driver_license, situation, customer_address, created_by)
         VALUES ($1, $2, $3, $4, 'در مسیر', $5, $6)
         RETURNING id AS "tpId"`,
        [request.body.orderId, driverName, driverPhone, driverLicense, orderResult.rows[0].address, request.user.id],
      );
      await client.query("UPDATE orders SET situation = 'exited' WHERE id = $1", [request.body.orderId]);
      return inserted.rows[0];
    });

    response.status(201).json({
      success: true,
      data: `وضعیت سفارش ${request.body.orderId} به در مسیر تغییر کرد`,
      transport,
    });
  }));

  return router;
}

module.exports = { createOrdersRouter, orderSelect };
