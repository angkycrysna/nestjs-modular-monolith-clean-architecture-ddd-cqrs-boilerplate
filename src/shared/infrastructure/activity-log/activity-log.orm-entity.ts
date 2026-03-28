import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Activity log table — immutable audit trail of all write operations.
 *
 * Every entry answers: WHO did WHAT to WHICH record, WHEN, and WHAT changed.
 * Designed for both backend debugging and frontend display via API.
 *
 * Lives in the 'shared' schema since it serves all modules.
 */
@Entity({ name: 'activity_logs', schema: 'shared' })
export class ActivityLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Dot-notation action identifier: <module>.<resource>.<verb>
   * e.g., 'user.profile.created', 'order.item.removed'
   */
  @Index()
  @Column()
  action!: string;

  // WHO
  /** ID of the user who performed the action (null for system actions). */
  @Index()
  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  /** Display name of the actor (e.g., 'John Doe', 'System', 'Scheduler'). */
  @Column({ name: 'actor_name' })
  actorName!: string;

  // WHAT
  /** The module that owns this action (e.g., 'user', 'order'). */
  @Index()
  @Column()
  module!: string;

  /** Human-readable description (e.g., 'User John Doe was created'). */
  @Column({ type: 'text' })
  note!: string;

  // WHICH
  /** ID of the affected entity (e.g., user profile ID, order ID). */
  @Index()
  @Column({ name: 'target_id', type: 'varchar', nullable: true })
  targetId!: string | null;

  /**
   * Table name of the affected entity, in snake_case.
   * e.g., 'users', 'user_profiles', 'orders', 'order_items'
   */
  @Index()
  @Column({ name: 'target_table', type: 'varchar', nullable: true })
  targetTable!: string | null;

  // WHAT CHANGED
  /** Previous state of the entity (null for create operations). */
  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData!: Record<string, unknown> | null;

  /** New state of the entity (null for delete operations). */
  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData!: Record<string, unknown> | null;

  // CONTEXT
  /** Correlation ID for request tracing. */
  @Index()
  @Column({ name: 'correlation_id' })
  correlationId!: string;

  /** IP address of the requester. */
  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress!: string | null;

  /** User agent of the requester. */
  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
