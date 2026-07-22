const { z } = require('zod');

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().min(1).default('postgresql://rana:rana@localhost:5432/rana'),
  DATABASE_SSL: z.enum(['true', 'false']).default('false'),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-before-production'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5175,http://localhost:5176'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

if (
  parsedEnvironment.data.NODE_ENV === 'production'
  && parsedEnvironment.data.JWT_SECRET.startsWith('development-only')
) {
  throw new Error('JWT_SECRET must be replaced in production');
}

const config = Object.freeze({
  environment: parsedEnvironment.data.NODE_ENV,
  port: parsedEnvironment.data.PORT,
  databaseUrl: parsedEnvironment.data.DATABASE_URL,
  databaseSsl: parsedEnvironment.data.DATABASE_SSL === 'true',
  jwtSecret: parsedEnvironment.data.JWT_SECRET,
  jwtExpiresIn: parsedEnvironment.data.JWT_EXPIRES_IN,
  corsOrigins: parsedEnvironment.data.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  logLevel: parsedEnvironment.data.LOG_LEVEL,
});

module.exports = { config };
