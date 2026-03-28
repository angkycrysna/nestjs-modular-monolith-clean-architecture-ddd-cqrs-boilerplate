import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT!, 10) || 3000,
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS!, 10) || 30000,
}));
