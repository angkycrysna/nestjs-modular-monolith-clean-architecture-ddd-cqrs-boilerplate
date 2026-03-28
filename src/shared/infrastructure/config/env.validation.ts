import { z } from 'zod';

export const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),

  // Security
  THROTTLE_TTL_MS: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(10),
  CORS_ORIGINS: z.string().default('*'),
  MAX_BODY_SIZE: z.string().default('10mb'),
  HMAC_ENABLED: z.string().default('false'),
  HMAC_SECRET: z.string().default(''),
  CSRF_ENABLED: z.string().default('false'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().default(''),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('postgres'),
  DB_SSL: z.string().default('false'),

  // Database Read Replica (optional — set to enable read/write splitting)
  DB_REPLICA_HOST: z.string().optional(),
  DB_REPLICA_PORT: z.coerce.number().optional(),

  // Redis (optional — cache is no-op when not set)
  REDIS_URL: z.string().optional(),

  // Kafka (optional — only needed when using KafkaMessageBroker)
  KAFKA_BROKERS: z.string().optional(),
  KAFKA_CLIENT_ID: z.string().optional(),
  KAFKA_GROUP_ID: z.string().optional(),
  KAFKA_SASL_USERNAME: z.string().optional(),
  KAFKA_SASL_PASSWORD: z.string().optional(),

  // RabbitMQ (optional — only needed when using RabbitMqMessageBroker)
  RABBITMQ_URL: z.string().optional(),
  RABBITMQ_EXCHANGE: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Environment validation failed:\n${result.error.message}`);
  }

  return result.data;
}
