/**
 * Forwards rejected async route handlers to Express error middleware.
 * @param {import('express').RequestHandler} handler async request handler
 * @returns {import('express').RequestHandler} Express-compatible handler
 */
function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

module.exports = { asyncHandler };
