const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/async-handler');
const { authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { HttpError, conflict, notFound } = require('../errors');
const {
  changeLocationState,
  findById,
  inventoryDefinitions,
  relocate,
} = require('../services/inventory');

const uidSchema = z.object({
  uid: z.string().trim().regex(/^(wsp|ins|car|fip)[A-Za-z0-9_-]+$/i),
});
const movementSchema = z.object({ wpId: z.string().trim().min(1).max(100) });
const relocationSchema = z.object({
  wpId: z.string().trim().min(1).max(100),
  sectorNew: z.string().trim().min(1).max(100),
});
const productionAssignmentParams = z.object({ ppId: z.string().trim().min(1).max(100) });
const productionAssignmentBody = z.object({
  uid: z.string().trim().regex(/^(wsp|ins)[A-Za-z0-9_-]+$/i),
  ppDevice: z.string().trim().min(1).max(200),
});
const reportQuerySchema = z.object({
  wpId: z.string().trim().max(100).optional().default(''),
  date: z.string().trim().max(30).optional().default(''),
  sector: z.string().trim().max(100).optional().default(''),
  material: z.string().trim().max(100).optional().default(''),
  color: z.string().trim().max(100).optional().default(''),
  type: z.string().trim().max(100).optional().default(''),
});

function sendMovementResult(response, action, qualityApproved) {
  const data = action === 'entry' ? 'محصول وارد شد' : 'محصول خارج شد';
  if (!qualityApproved) {
    return response.json({
      success: 'alert',
      data,
      alert: 'محصول مورد نظر تاییدیه کنترل کیفیت ندارد',
    });
  }
  return response.json({ success: true, data });
}

function createInventoryRouter(database) {
  const router = Router();

  router.put('/entry/:uid', authorize('admin', 'operator', 'security'), validate('params', uidSchema), validate('body', movementSchema), asyncHandler(async (request, response) => {
    const result = await changeLocationState({
      database,
      uid: request.params.uid,
      workplaceId: request.body.wpId,
      action: 'entry',
      userId: request.user.id,
    });
    return sendMovementResult(response, 'entry', result.qualityApproved);
  }));

  router.put('/exit/:uid', authorize('admin', 'operator', 'security'), validate('params', uidSchema), validate('body', movementSchema), asyncHandler(async (request, response) => {
    const result = await changeLocationState({
      database,
      uid: request.params.uid,
      workplaceId: request.body.wpId,
      action: 'exit',
      userId: request.user.id,
    });
    return sendMovementResult(response, 'exit', result.qualityApproved);
  }));

  router.put('/placement/:uid', authorize('admin', 'operator'), validate('params', uidSchema), validate('body', relocationSchema), asyncHandler(async (request, response) => {
    await relocate({
      database,
      uid: request.params.uid,
      workplaceId: request.body.wpId,
      sector: request.body.sectorNew,
      userId: request.user.id,
    });
    response.json({ success: true, data: `محصول به سکتور ${request.body.sectorNew} منتقل شد` });
  }));

  router.get('/uidDetails/:uid', authorize('admin', 'operator', 'security'), validate('params', uidSchema), asyncHandler(async (request, response) => {
    const rows = await findById(database, request.params.uid);
    response.json({ success: true, data: rows });
  }));

  router.put(
    '/pp/assign/:ppId',
    authorize('admin', 'operator'),
    validate('params', productionAssignmentParams),
    validate('body', productionAssignmentBody),
    asyncHandler(async (request, response) => {
      const { ppId } = request.params;
      const { uid, ppDevice } = request.body;
      const definition = inventoryDefinitions[uid.slice(0, 3).toLowerCase()];

      await database.withTransaction(async (client) => {
        const plan = await client.query('SELECT id FROM production_plans WHERE id = $1 FOR UPDATE', [ppId]);
        if (plan.rowCount === 0) throw notFound('برنامه تولید یافت نشد');

        const inventoryItem = await client.query(
          `SELECT id, location_state FROM ${definition.table} WHERE id = $1 FOR UPDATE`,
          [uid],
        );
        if (inventoryItem.rowCount === 0) throw notFound('کالای مصرفی یافت نشد');
        if (inventoryItem.rows[0].location_state !== 'ورود') {
          throw conflict('کالای مصرفی باید ابتدا در محل تولید ثبت ورود شود');
        }

        const wireSpoolId = definition.itemType === 'wire_spool' ? uid : null;
        const insulationBatchId = definition.itemType === 'insulation' ? uid : null;
        try {
          await client.query(
            `INSERT INTO production_plan_materials
              (production_plan_id, wire_spool_id, insulation_batch_id, assigned_by)
             VALUES ($1, $2, $3, $4)`,
            [ppId, wireSpoolId, insulationBatchId, request.user.id],
          );
        } catch (error) {
          if (error.code === '23505') throw conflict('این کالا پیش‌تر به برنامه تولید تخصیص یافته است');
          throw error;
        }

        await client.query('UPDATE production_plans SET device = $1 WHERE id = $2', [ppDevice, ppId]);
        await client.query(`UPDATE ${definition.table} SET location_state = 'مصرف شده' WHERE id = $1`, [uid]);
        await client.query(
          `INSERT INTO inventory_movements (item_type, item_id, action, performed_by, metadata)
           VALUES ($1, $2, 'consume', $3, jsonb_build_object('productionPlanId', $4::text))`,
          [definition.itemType, uid, request.user.id, ppId],
        );
      });

      response.json({ success: true, data: 'محصول به برنامه تولید اضافه شد' });
    }),
  );

  router.get('/report/query', authorize('admin', 'operator'), validate('query', reportQuerySchema), asyncHandler(async (request, response) => {
    const filters = request.query;
    const commonValues = [
      filters.wpId || null,
      filters.date || null,
      filters.sector || null,
    ];

    const [wireSpools, insulation, finalProducts] = await Promise.all([
      filters.color || filters.type
        ? Promise.resolve({ rows: [] })
        : database.query(
          `SELECT ${inventoryDefinitions.wsp.select}
           FROM wire_spools
           WHERE ($1::text IS NULL OR workplace_id = $1)
             AND ($2::text IS NULL OR recorded_at::date::text = $2)
             AND ($3::text IS NULL OR sector ILIKE '%' || $3 || '%')
             AND ($4::text IS NULL OR material ILIKE '%' || $4 || '%')
             AND location_state = 'ورود'
           ORDER BY recorded_at DESC`,
          [...commonValues, filters.material || null],
        ),
      filters.material || filters.type
        ? Promise.resolve({ rows: [] })
        : database.query(
          `SELECT ${inventoryDefinitions.ins.select}
           FROM insulation_batches
           WHERE ($1::text IS NULL OR workplace_id = $1)
             AND ($2::text IS NULL OR entry_date::date::text = $2)
             AND ($3::text IS NULL OR sector ILIKE '%' || $3 || '%')
             AND ($4::text IS NULL OR color ILIKE '%' || $4 || '%')
             AND location_state = 'ورود'
           ORDER BY entry_date DESC`,
          [...commonValues, filters.color || null],
        ),
      filters.material || filters.color
        ? Promise.resolve({ rows: [] })
        : database.query(
          `SELECT ${inventoryDefinitions.fip.select}
           FROM final_products
           WHERE ($1::text IS NULL OR workplace_id = $1)
             AND ($2::text IS NULL OR created_at::date::text = $2)
             AND ($3::text IS NULL OR sector ILIKE '%' || $3 || '%')
             AND ($4::text IS NULL OR type ILIKE '%' || $4 || '%')
             AND location_state = 'ورود'
           ORDER BY created_at DESC`,
          [...commonValues, filters.type || null],
        ),
    ]);

    const data = [wireSpools.rows, insulation.rows, finalProducts.rows];
    if (data.every((items) => items.length === 0)) throw new HttpError(404, 'کالایی یافت نشد');
    response.json({ success: true, data });
  }));

  return router;
}

module.exports = { createInventoryRouter };
