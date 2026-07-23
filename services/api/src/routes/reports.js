const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/async-handler');
const { authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { HttpError } = require('../errors');
const { inventoryDefinitions } = require('../services/inventory');
const { orderSelect } = require('./orders');

const inventoryTypeSchema = z.enum(['wsp', 'ins', 'car', 'fip']);
const inventoryReportSchema = z.object({
  searchType: inventoryTypeSchema,
  wpId: z.string().trim().min(1).max(100),
});
const defaultInventoryReportSchema = z.object({ searchType: inventoryTypeSchema });
const productionDateSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((value) => value.startDate <= value.endDate, {
  message: 'تاریخ شروع باید پیش از تاریخ پایان باشد',
});
const productionDaysSchema = z.object({
  daysBefore: z.coerce.number().int().min(1).max(3_650).default(180),
});
const analyticsSchema = z.object({
  months: z.coerce.number().int().min(3).max(24).default(12),
});
const warehouseSchema = z.object({ wpId: z.string().trim().min(1).max(100).default('wp1') });

const productionPlanSelect = `
  pp.id AS "ppId",
  pp.manufactured_at AS "ppMFG",
  pp.device AS "ppDevice",
  pp.product_amount AS "ppProductAmount",
  pp.linear_velocity AS "ppLinearVel",
  pp.overlap AS "ppOverlap",
  pp.product_state AS "ppProdState",
  pp.produced_length AS "ppLength",
  pp.gauge AS "ppGauge",
  pp.annealing_percent AS "ppAnnealing",
  pp.insulation_type AS "insType",
  pp.insulation_color AS "insColor",
  pp.product_size AS "ppSize",
  pp.product_id AS "prodId",
  pp.output_gauge AS "ppOutGauge",
  pp.arc_length AS "ppArcLength",
  pp.material_amount AS "ppMaterialAmount",
  pp.input_speed AS "ppInSp",
  pp.output_speed AS "ppOutSp",
  pp.user_id AS "ppUserId",
  pp.situation AS "ppSituation",
  pp.detail AS "ppDetail",
  COALESCE(string_agg(DISTINCT ppm.wire_spool_id, '-' ORDER BY ppm.wire_spool_id) FILTER (WHERE ppm.wire_spool_id IS NOT NULL), '') AS "wspId",
  COALESCE(string_agg(DISTINCT ppm.insulation_batch_id, '-' ORDER BY ppm.insulation_batch_id) FILTER (WHERE ppm.insulation_batch_id IS NOT NULL), '') AS "insId"
`;

async function fetchInventory(database, type, whereClause, values, suffix = '') {
  const definition = inventoryDefinitions[type];
  return database.query(
    `SELECT ${definition.select} FROM ${definition.table} ${whereClause} ${suffix}`,
    values,
  );
}

function createReportsRouter(database) {
  const router = Router();
  router.use('/adminreport', authorize('admin', 'analyst'));

  router.get('/adminreport', validate('query', inventoryReportSchema), asyncHandler(async (request, response) => {
    const result = await fetchInventory(
      database,
      request.query.searchType,
      'WHERE workplace_id = $1',
      [request.query.wpId],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/pp', validate('query', productionDateSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT ${productionPlanSelect}
       FROM production_plans pp
       LEFT JOIN production_plan_materials ppm ON ppm.production_plan_id = pp.id
       WHERE pp.manufactured_at >= $1 AND pp.manufactured_at < $2::timestamptz + interval '1 day'
       GROUP BY pp.id
       ORDER BY pp.manufactured_at DESC`,
      [request.query.startDate, request.query.endDate],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/pp/default', validate('query', productionDaysSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT ${productionPlanSelect}
       FROM production_plans pp
       LEFT JOIN production_plan_materials ppm ON ppm.production_plan_id = pp.id
       WHERE pp.manufactured_at >= current_date - ($1::integer * interval '1 day')
       GROUP BY pp.id
       ORDER BY pp.manufactured_at DESC`,
      [request.query.daysBefore],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/default', validate('query', defaultInventoryReportSchema), asyncHandler(async (request, response) => {
    const type = request.query.searchType;
    const definition = inventoryDefinitions[type];
    const isFinalProduct = type === 'fip';
    const result = await fetchInventory(
      database,
      type,
      isFinalProduct ? '' : `WHERE ${definition.dateColumn} >= current_date - interval '7 days'`,
      [],
      `ORDER BY ${definition.dateColumn} DESC LIMIT ${isFinalProduct ? 10 : 250}`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/order/submitted/counter', asyncHandler(async (_request, response) => {
    const result = await database.query(
      "SELECT count(*)::integer AS counted FROM orders WHERE lower(situation) = 'submitted'",
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/order/gathered/counter', asyncHandler(async (_request, response) => {
    const result = await database.query(
      "SELECT count(*)::integer AS counted FROM orders WHERE lower(situation) = 'gathered'",
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/order/exited/counter', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT count(*)::integer AS counted FROM orders
       WHERE lower(situation) = 'exited' AND ordered_at >= current_date - interval '7 days'`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/cart/length', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT COALESCE(sum(length), 0)::double precision AS total
       FROM carts WHERE manufactured_at >= current_date - interval '7 days'`,
    );
    response.json({ success: true, data: result.rows[0].total });
  }));

  router.get('/adminreport/warehouse/stock', validate('query', warehouseSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT
        (SELECT count(*)::integer FROM wire_spools WHERE workplace_id = $1 AND location_state = 'ورود') AS "wireSpoolCount",
        (SELECT count(*)::integer FROM insulation_batches WHERE workplace_id = $1 AND location_state = 'ورود') AS "InsulCount",
        (SELECT count(*)::integer FROM carts WHERE workplace_id = $1 AND location_state = 'ورود') AS "cartCount"`,
      [request.query.wpId],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/noQC', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT
        (SELECT count(*)::integer FROM wire_spools WHERE quality_approved = false) AS "wireSpoolCount",
        (SELECT count(*)::integer FROM insulation_batches WHERE quality_approved = false) AS "InsulCount",
        (SELECT count(*)::integer FROM carts WHERE quality_approved = false) AS "cartCount"`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/order/lastOfUs', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT ${orderSelect} FROM orders o ORDER BY o.ordered_at DESC LIMIT 5`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/order/lastOfUs2', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT ${orderSelect} FROM orders o
       WHERE lower(o.situation) = 'exited' ORDER BY o.ordered_at DESC LIMIT 5`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/highDemandChart', asyncHandler(async (_request, response) => {
    const result = await database.query(
      `SELECT p.name AS "prodName", COALESCE(sum(oi.quantity), 0)::integer AS "totalCount"
       FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id
       GROUP BY p.id, p.name ORDER BY "totalCount" DESC, p.name`,
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminreport/summary', asyncHandler(async (_request, response) => {
    const result = await database.query(`
      SELECT
        (SELECT count(*)::integer FROM orders WHERE lower(situation) = 'submitted') AS "submittedOrders",
        (SELECT count(*)::integer FROM orders WHERE lower(situation) = 'gathered') AS "gatheredOrders",
        (SELECT count(*)::integer FROM orders WHERE lower(situation) = 'exited' AND ordered_at >= current_date - interval '7 days') AS "weeklyExitedOrders",
        (SELECT count(*)::integer FROM requests WHERE status = 'pending') AS "pendingRequests",
        (SELECT count(*)::integer FROM final_products WHERE location_state = 'ورود') AS "availableFinalProducts"
    `);
    response.json({ success: true, data: result.rows[0] });
  }));

  router.get('/adminreport/analytics', validate('query', analyticsSchema), asyncHandler(async (request, response) => {
    const months = request.query.months;
    const [
      summary,
      monthlyOrders,
      productDemand,
      inventory,
      requestStatus,
      productionTrend,
      recentRequests,
    ] = await Promise.all([
      database.query(`
        SELECT
          count(*)::integer AS "totalOrders",
          count(*) FILTER (WHERE lower(situation) = 'submitted')::integer AS "submittedOrders",
          count(*) FILTER (WHERE lower(situation) = 'gathered')::integer AS "gatheredOrders",
          count(*) FILTER (WHERE lower(situation) = 'security checked')::integer AS "securityCheckedOrders",
          count(*) FILTER (WHERE lower(situation) = 'exited')::integer AS "exitedOrders",
          count(*) FILTER (WHERE ordered_at >= current_date - interval '30 days')::integer AS "ordersThisMonth"
        FROM orders
      `),
      database.query(`
        WITH month_series AS (
          SELECT generate_series(
            date_trunc('month', current_date) - (($1::integer - 1) * interval '1 month'),
            date_trunc('month', current_date),
            interval '1 month'
          ) AS month_start
        )
        SELECT
          to_char(ms.month_start, 'YYYY-MM') AS month,
          count(o.id)::integer AS total,
          count(o.id) FILTER (WHERE lower(o.situation) = 'submitted')::integer AS submitted,
          count(o.id) FILTER (WHERE lower(o.situation) = 'gathered')::integer AS gathered,
          count(o.id) FILTER (WHERE lower(o.situation) = 'exited')::integer AS exited
        FROM month_series ms
        LEFT JOIN orders o
          ON o.ordered_at >= ms.month_start
         AND o.ordered_at < ms.month_start + interval '1 month'
        GROUP BY ms.month_start
        ORDER BY ms.month_start
      `, [months]),
      database.query(`
        SELECT p.id AS "productId", p.name, COALESCE(sum(oi.quantity), 0)::integer AS quantity
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY quantity DESC, p.name
        LIMIT 8
      `),
      database.query(`
        SELECT 'wireSpools' AS key, 'قرقره سیم' AS label,
          count(*)::integer AS total,
          count(*) FILTER (WHERE location_state = 'ورود')::integer AS available,
          count(*) FILTER (WHERE quality_approved = false)::integer AS "qcPending"
        FROM wire_spools
        UNION ALL
        SELECT 'insulation', 'مواد عایق', count(*)::integer,
          count(*) FILTER (WHERE location_state = 'ورود')::integer,
          count(*) FILTER (WHERE quality_approved = false)::integer
        FROM insulation_batches
        UNION ALL
        SELECT 'carts', 'سبد تولید', count(*)::integer,
          count(*) FILTER (WHERE location_state = 'ورود')::integer,
          count(*) FILTER (WHERE quality_approved = false)::integer
        FROM carts
        UNION ALL
        SELECT 'finalProducts', 'محصول نهایی', count(*)::integer,
          count(*) FILTER (WHERE location_state = 'ورود')::integer,
          0::integer
        FROM final_products
      `),
      database.query(`
        SELECT
          status,
          count(*)::integer AS count,
          round((avg(extract(epoch FROM (resolved_at - requested_at)) / 3600)
            FILTER (WHERE resolved_at IS NOT NULL))::numeric, 1) AS "averageResolutionHours"
        FROM requests
        GROUP BY status
        ORDER BY status
      `),
      database.query(`
        WITH month_series AS (
          SELECT generate_series(
            date_trunc('month', current_date) - (($1::integer - 1) * interval '1 month'),
            date_trunc('month', current_date),
            interval '1 month'
          ) AS month_start
        )
        SELECT
          to_char(ms.month_start, 'YYYY-MM') AS month,
          COALESCE(sum(pp.product_amount), 0)::double precision AS amount,
          count(pp.id)::integer AS plans
        FROM month_series ms
        LEFT JOIN production_plans pp
          ON pp.manufactured_at >= ms.month_start
         AND pp.manufactured_at < ms.month_start + interval '1 month'
        GROUP BY ms.month_start
        ORDER BY ms.month_start
      `, [months]),
      database.query(`
        SELECT
          r.id AS "requestId",
          r.type,
          r.status,
          r.requested_at AS "requestedAt",
          sender.full_name AS sender,
          receiver.full_name AS receiver
        FROM requests r
        JOIN users sender ON sender.id = r.sender_id
        JOIN users receiver ON receiver.id = r.receiver_id
        ORDER BY r.requested_at DESC
        LIMIT 8
      `),
    ]);

    response.json({
      success: true,
      data: {
        summary: summary.rows[0],
        monthlyOrders: monthlyOrders.rows,
        productDemand: productDemand.rows,
        inventory: inventory.rows,
        requestStatus: requestStatus.rows,
        productionTrend: productionTrend.rows,
        recentRequests: recentRequests.rows,
      },
    });
  }));

  return router;
}

module.exports = { createReportsRouter, productionPlanSelect };
