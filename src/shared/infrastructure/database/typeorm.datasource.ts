import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource for CLI-based migrations.
 *
 * This file is used by the TypeORM CLI (migration:generate, migration:run, etc.)
 * and is NOT used at runtime — the app uses DatabaseModule instead.
 *
 * Usage:
 *   pnpm migration:generate src/modules/<module>/infrastructure/persistence/typeorm/migrations/<MigrationName>
 *   pnpm migration:run
 *   pnpm migration:revert
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Scan module + shared migration directories
  migrations: [
    'src/modules/**/infrastructure/persistence/typeorm/migrations/*.ts',
    'src/shared/infrastructure/**/migrations/*.ts',
  ],

  // Scan module + shared ORM entities
  entities: [
    'src/modules/**/infrastructure/persistence/typeorm/entities/*.ts',
    'src/shared/infrastructure/**/*.orm-entity.ts',
  ],
});
