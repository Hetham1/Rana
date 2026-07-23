const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Router } = require('express');
const { z } = require('zod');
const { config } = require('../config');
const { HttpError } = require('../errors');
const { asyncHandler } = require('../middleware/async-handler');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

async function verifyPassword(password, storedHash) {
  if (storedHash.startsWith('$2')) return bcrypt.compare(password, storedHash);

  // Legacy SHA-256 hashes are accepted once and upgraded after a successful login.
  if (/^[a-f\d]{64}$/i.test(storedHash)) {
    const incomingHash = crypto.createHash('sha256').update(password).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(storedHash));
  }
  return false;
}

function createAuthRouter(database) {
  const router = Router();

  router.post('/login', validate('body', loginSchema), asyncHandler(async (request, response) => {
    const result = await database.query(
      `SELECT u.id, u.username, u.password_hash, u.full_name, u.workplace_id, u.role, w.name AS workplace_name
       FROM users u
       LEFT JOIN workplaces w ON w.id = u.workplace_id
       WHERE lower(u.username) = lower($1) AND u.is_active = true`,
      [request.body.username],
    );

    const user = result.rows[0];
    if (!user || !(await verifyPassword(request.body.password, user.password_hash))) {
      throw new HttpError(401, 'نام کاربری یا رمز عبور اشتباه است');
    }

    if (!user.password_hash.startsWith('$2')) {
      const upgradedHash = await bcrypt.hash(request.body.password, 12);
      await database.query('UPDATE users SET password_hash = $1 WHERE id = $2', [upgradedHash, user.id]);
    }

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        workplaceId: user.workplace_id,
      },
      config.jwtSecret,
      { algorithm: 'HS256', expiresIn: config.jwtExpiresIn },
    );

    response.json({
      success: true,
      token,
      workPlace: user.workplace_name || user.workplace_id,
      workPlaceId: user.workplace_id,
      userId: user.id,
      fullName: user.full_name,
      role: user.role,
    });
  }));

  router.post('/logout', (_request, response) => {
    response.json({ success: true, message: 'با موفقیت از حساب کاربری خارج شدید' });
  });

  router.get('/protected', authenticate, (request, response) => {
    response.json({ success: true, data: { user: request.user } });
  });

  return router;
}

module.exports = { createAuthRouter, verifyPassword };
