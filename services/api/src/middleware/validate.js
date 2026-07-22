const { HttpError } = require('../errors');

/**
 * Validates request input and replaces it with Zod-parsed values.
 * @param {'body'|'query'|'params'} location request property to validate
 * @param {import('zod').ZodType} schema validation schema
 */
function validate(location, schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request[location]);
    if (!result.success) {
      return next(new HttpError(400, 'اطلاعات ارسالی معتبر نیست', result.error.flatten()));
    }
    request[location] = result.data;
    return next();
  };
}

module.exports = { validate };
