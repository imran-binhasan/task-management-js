import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),

  JWT_SECRET: Joi.string().required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters for security',
  }),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
});