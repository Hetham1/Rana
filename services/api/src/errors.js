class HttpError extends Error {
  /**
   * Represents an expected client-facing HTTP failure.
   * @param {number} statusCode HTTP response status
   * @param {string} message safe message returned to the client
   * @param {unknown} details optional validation details
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFound(message) {
  return new HttpError(404, message);
}

function conflict(message) {
  return new HttpError(409, message);
}

module.exports = { HttpError, notFound, conflict };
