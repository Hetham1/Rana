const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const pinoHttp = require('pino-http');
const { config } = require('./config');
const defaultDatabase = require('./database');
const { authenticate } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errors');
const { asyncHandler } = require('./middleware/async-handler');
const { createAuthRouter } = require('./routes/auth');
const { createCatalogRouter } = require('./routes/catalog');
const { createInventoryRouter } = require('./routes/inventory');
const { createOrdersRouter } = require('./routes/orders');
const { createReportsRouter } = require('./routes/reports');
const { createRequestsRouter } = require('./routes/requests');

function createApp({ database = defaultDatabase } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.use(pinoHttp({
    level: config.logLevel,
    redact: {
      paths: ['req.headers.authorization', 'req.body.password'],
      censor: '[REDACTED]',
    },
  }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86_400,
  }));
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: false, limit: '256kb' }));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'etemad-rana-api' });
  });
  app.get('/ready', asyncHandler(async (_request, response) => {
    await database.query('SELECT 1');
    response.json({ status: 'ready' });
  }));

  const apiRouter = express.Router();
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'تعداد تلاش‌های ورود بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید' },
  });

  apiRouter.use('/login', loginLimiter);
  apiRouter.use(createAuthRouter(database));
  apiRouter.use(authenticate);
  apiRouter.use(createCatalogRouter(database));
  apiRouter.use(createInventoryRouter(database));
  apiRouter.use(createOrdersRouter(database));
  apiRouter.use(createRequestsRouter(database));
  apiRouter.use(createReportsRouter(database));
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
