import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  CORS_ORIGIN: Joi.string().uri().required(),
  SECURE_COOKIES: Joi.boolean().default(false),
  TURNSTILE_SECRET_KEY: Joi.string().optional(),
  RESEND_API_KEY: Joi.string().optional(),
  RESEND_FROM_EMAIL: Joi.string().email().optional(),
  FRONTEND_URL: Joi.string().uri().optional(),
});
