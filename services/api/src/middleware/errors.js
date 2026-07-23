const { HttpError } = require('../errors');

function notFoundHandler(_request, _response, next) {
  next(new HttpError(404, 'مسیر درخواستی یافت نشد'));
}

function errorHandler(error, request, response, _next) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;

  if (statusCode >= 500) {
    request.log?.error({ err: error }, 'Unhandled request error');
  }

  const payload = {
    success: false,
    error: error instanceof HttpError ? error.message : 'خطای داخلی سرور رخ داد',
  };

  if (error instanceof HttpError && error.details) {
    payload.details = error.details;
  }

  response.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
