import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true',

  // ── Read Replica (future) ──
  // Set these env vars to enable automatic read/write splitting.
  // When set:
  //   - Commands (save/update/delete) → primary (DB_HOST)
  //   - Queries (find/select)         → replica (DB_REPLICA_HOST)
  // When not set:
  //   - All operations → single primary connection
  replicaHost: process.env.DB_REPLICA_HOST || '',
  replicaPort:
    parseInt(process.env.DB_REPLICA_PORT!, 10) ||
    parseInt(process.env.DB_PORT!, 10) ||
    5432,
}));
