import { randomUUID } from 'crypto';

/**
 * Base class for domain events.
 *
 * Domain events represent something meaningful that happened within an aggregate.
 * They are raised by aggregate roots and dispatched after the aggregate is persisted.
 *
 * Domain events are local to a bounded context (module). For cross-module
 * communication, use IntegrationEvent instead.
 *
 * @example
 * ```typescript
 * export class UserCreatedEvent extends DomainEvent {
 *   constructor(
 *     aggregateId: string,
 *     public readonly name: string,
 *     public readonly email: string,
 *   ) {
 *     super(aggregateId);
 *   }
 * }
 * ```
 */
export abstract class DomainEvent {
  /** Unique event identifier (UUID v4). */
  public readonly eventId: string;

  /** Timestamp when the event occurred. */
  public readonly occurredOn: Date;

  /** The ID of the aggregate that raised this event. */
  public readonly aggregateId: string;

  /** Event name derived from the class name (e.g., 'UserCreatedEvent'). */
  public readonly eventName: string;

  protected constructor(aggregateId: string) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
    this.eventName = this.constructor.name;
  }
}
