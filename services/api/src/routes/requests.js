const { Router } = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/async-handler');
const { authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { conflict, notFound } = require('../errors');

const requestParamsSchema = z.object({ reqId: z.string().trim().min(1).max(100) });
const createRequestSchema = z.object({
  reqType: z.string().trim().min(1).max(150),
  reqDetail: z.string().trim().max(2_000).optional().default(''),
  reqReciever: z.string().trim().min(1).max(100),
  userId: z.string().trim().max(100).optional(),
});
const resolveRequestSchema = z.object({
  reqOk: z.enum(['approved', 'denied', '1', '0']),
  reqReciever: z.string().trim().max(100).optional(),
});

const requestSelect = `
  r.id AS "reqId",
  r.requested_at AS "reqDate",
  r.type AS "reqType",
  r.detail AS "reqDetail",
  CASE r.status WHEN 'approved' THEN '1' WHEN 'denied' THEN '0' ELSE 'pending' END AS "reqOk",
  r.sender_id AS "reqSender",
  r.receiver_id AS "reqReciever"
`;

function createRequestsRouter(database) {
  const router = Router();

  router.get('/request', asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT ${requestSelect} FROM requests r
       WHERE r.receiver_id = $1 AND r.status = 'pending'
       ORDER BY r.requested_at DESC`,
      [request.user.id],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.put('/request/:reqId', validate('params', requestParamsSchema), validate('body', resolveRequestSchema), asyncHandler(async (request, response) => {
    const status = ['approved', '1'].includes(request.body.reqOk) ? 'approved' : 'denied';
    const result = await database.query(
      `UPDATE requests SET status = $1, resolved_at = now()
       WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
       RETURNING id`,
      [status, request.params.reqId, request.user.id],
    );
    if (result.rowCount === 0) throw conflict('درخواست قبلاً تعیین تکلیف شده یا متعلق به این کاربر نیست');
    response.json({ success: true, data: status === 'approved' ? 'درخواست تایید شد' : 'درخواست رد شد' });
  }));

  router.get('/secrequest', asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT ${requestSelect} FROM requests r
       WHERE r.sender_id = $1 AND r.status = 'pending'
       ORDER BY r.requested_at DESC`,
      [request.user.id],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.post('/request/new', validate('body', createRequestSchema), asyncHandler(async (request, response) => {
    if (request.user.id === request.body.reqReciever) {
      throw conflict('فرستنده و گیرنده درخواست نمی‌توانند یکسان باشند');
    }
    const receiver = await database.query('SELECT id FROM users WHERE id = $1 AND is_active = true', [request.body.reqReciever]);
    if (receiver.rowCount === 0) throw notFound('گیرنده درخواست یافت نشد');

    const result = await database.query(
      `INSERT INTO requests (type, detail, sender_id, receiver_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id AS "reqId"`,
      [request.body.reqType, request.body.reqDetail || null, request.user.id, request.body.reqReciever],
    );
    response.status(201).json({ success: true, data: 'درخواست به کاربر ارسال شد', request: result.rows[0] });
  }));

  router.use('/adminrequest', authorize('admin'));

  router.get('/adminrequest/sent', asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT ${requestSelect} FROM requests r WHERE r.sender_id = $1 ORDER BY r.requested_at DESC`,
      [request.user.id],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.get('/adminrequest/received', asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT ${requestSelect} FROM requests r
       WHERE r.receiver_id = $1 AND r.status = 'pending'
       ORDER BY r.requested_at DESC`,
      [request.user.id],
    );
    response.json({ success: true, data: result.rows });
  }));

  router.delete('/adminrequest/sent/delete/:reqId', validate('params', requestParamsSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `DELETE FROM requests WHERE id = $1 AND sender_id = $2 AND status = 'pending' RETURNING id`,
      [request.params.reqId, request.user.id],
    );
    if (result.rowCount === 0) throw notFound('درخواست در انتظار متعلق به شما یافت نشد');
    response.json({ success: true, data: 'درخواست ارسالی حذف شد' });
  }));

  async function resolveAdminRequest(request, response, status) {
    const result = await database.query(
      `UPDATE requests SET status = $1, resolved_at = now()
       WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
       RETURNING id`,
      [status, request.params.reqId, request.user.id],
    );
    if (result.rowCount === 0) throw conflict('درخواست قبلاً تعیین تکلیف شده یا متعلق به شما نیست');
    response.json({ success: true, data: status === 'approved' ? 'درخواست با موفقیت تایید شد' : 'درخواست با موفقیت رد شد' });
  }

  router.put('/adminrequest/received/approve/:reqId', validate('params', requestParamsSchema), asyncHandler((request, response) => (
    resolveAdminRequest(request, response, 'approved')
  )));
  router.put('/adminrequest/received/deny/:reqId', validate('params', requestParamsSchema), asyncHandler((request, response) => (
    resolveAdminRequest(request, response, 'denied')
  )));

  return router;
}

module.exports = { createRequestsRouter };
