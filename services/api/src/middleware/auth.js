const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { HttpError } = require('../errors');

/**
 * Verifies either a standard Bearer token or the legacy raw Authorization token.
 */
function authenticate(request, _response, next) {
  const authorization = request.get('authorization');
  if (!authorization) {
    return next(new HttpError(401, 'دسترسی به این بخش نیازمند ورود است'));
  }

  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : authorization.trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    });
    request.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      workplaceId: payload.workplaceId,
    };
    return next();
  } catch (_error) {
    return next(new HttpError(401, 'نشست شما معتبر نیست؛ دوباره وارد شوید'));
  }
}

/**
 * Restricts an authenticated route to the named application roles.
 * Authentication is mounted before protected routers in src/app.js.
 */
function authorize(...allowedRoles) {
  const allowed = new Set(allowedRoles);
  return (request, _response, next) => {
    if (!request.user || !allowed.has(request.user.role)) {
      return next(new HttpError(403, 'نقش کاربری شما اجازه انجام این عملیات را ندارد'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
