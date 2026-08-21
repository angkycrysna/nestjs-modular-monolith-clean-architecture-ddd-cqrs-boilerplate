import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Possible statuses for an outbox event.
 *
 * - `pending`    — Newly created, waiting to be dispatched.
 * - `processing` — Picked up by the outbox processor, dispatch in progress.
 * - `published`  — Successfully dispatched to the message broker.
 * - `failed`     — All retry attempts exhausted. Requires manual intervention.
 */
export enum OutboxEventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

/**
 * Outbox table — stores integration events for reliable async delivery.
 *
 * Events are written to this table in the SAME transaction as the business
 * write. The outbox processor reads pending events and dispatches them
 * to the configured message broker.
 *
 * Lives in the 'shared' schema since it serves all modules.
 */
@Entity({ name: 'outbox_events' })
export class OutboxOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  /** Stable dot-notation event name (e.g., 'user.registered'). Used as broker topic. */
  @Index()
  @Column({ name: 'event_name' })
  eventName!: string;

  /** JSON-serialized event payload. */
  @Column({ type: 'jsonb' })
  payload!: string;

  /** When the event was created. */
  @CreateDateColumn({ name: 'occurred_on', type: 'timestamptz' })
  occurredOn!: Date;

  /** Current processing status. Indexed for efficient polling by the processor. */
  @Index()
  @Column({
    type: 'enum',
    enum: OutboxEventStatus,
    default: OutboxEventStatus.PENDING,
  })
  status!: OutboxEventStatus;

  /** When the event was successfully dispatched (null until published). */
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  /** Number of dispatch attempts so far. */
  @Column({ name: 'retry_count', default: 0 })
  retryCount!: number;

  /**
   * Maximum number of retry attempts before marking as 'failed'.
   * Configurable per event — critical events can have higher retry limits.
   */
  @Column({ name: 'max_retries', default: 5 })
  maxRetries!: number;

  /** Last error message from a failed dispatch attempt (null if never failed). */
  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  /**
   * Arbitrary metadata for debugging and tracing.
   * E.g., { correlationId, sourceModule, aggregateId, aggregateType }.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
