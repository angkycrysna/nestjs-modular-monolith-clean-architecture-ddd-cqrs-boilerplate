import { PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Base TypeORM entity with standard audit columns.
 *
 * All module ORM entities should extend this class to get consistent
 * id, created_at, and updated_at columns.
 *
 * This is an INFRASTRUCTURE concern — it maps to database columns.
 * Domain entities extend BaseEntity (domain layer) instead.
 * The mapper layer translates between the two.
 *
 * @example
 * ```typescript
 * @Entity({ name: 'users', schema: USER_DB_SCHEMA })
 * export class UserOrmEntity extends BaseTypeOrmEntity {
 *   @Column()
 *   name!: string;
 *
 *   @Column({ unique: true })
 *   email!: string;
 * }
 * ```
 */
export abstract class BaseTypeOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
