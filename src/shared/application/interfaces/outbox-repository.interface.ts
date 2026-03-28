/** Injection token for the outbox repository. */
export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');

/**
 * Possible statuses for an outbox event.
 */
export enum OutboxEventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

/**
 * Shape of an outbox event record.
 */
export interface OutboxEvent {
  /** Unique event identifier. */
  id: string;
  /** Stable dot-notation event name (e.g., 'user.registered'). */
  eventName: string;
  /** JSON-serialized event payload. */
  payload: string;
  /** When the event was created. */
  occurredOn: Date;
  /** Current processing status. */
  status: OutboxEventStatus;
  /** When the event was dispatched (null until published). */
  publishedAt: Date | null;
  /** Number of dispatch attempts so far. */
  retryCount: number;
  /** Maximum retry attempts before marking as 'failed'. */
  maxRetries: number;
  /** Last error message from a failed dispatch attempt. */
  lastError: string | null;
  /** Arbitrary metadata for debugging and tracing. */
  metadata: Record<string, unknown> | null;
}

/**
 * Outbox repository port — persists integration events for reliable delivery.
 *
 * Integration events are written to the outbox table in the same database
 * transaction as the business write. The outbox processor reads unpublished
 * events and dispatches them to the message broker.
 *
 * This guarantees at-least-once delivery without distributed transactions.
 */
export interface IOutboxRepository {
  /**
   * Persist an event to the outbox table.
   * Should be called within the same transaction as the business write.
   */
  store(
    event: Pick<OutboxEvent, 'id' | 'eventName' | 'payload' | 'occurredOn'> & {
      maxRetries?: number;
      metadata?: Record<string, unknown> | null;
    },
  ): Promise<void>;

  /**
   * Fetch pending events, ordered by creation time.
   * Atomically sets their status to 'processing' to prevent double-dispatch.
   *
   * @param limit - Maximum number of events to fetch.
   */
  fetchPending(limit: number): Promise<OutboxEvent[]>;

  /**
   * Mark an event as successfully published.
   */
  markPublished(id: string): Promise<void>;

  /**
   * Record a failed dispatch attempt.
   * Increments retry count and stores the error message.
   * If retryCount >= maxRetries, status is set to 'failed'.
   */
  markFailed(id: string, error: string): Promise<void>;
}
