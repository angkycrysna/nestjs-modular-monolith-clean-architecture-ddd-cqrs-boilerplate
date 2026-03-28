import { randomUUID } from 'crypto';

/**
 * Base class for integration events.
 *
 * Integration events are used for cross-module (bounded context) communication.
 * Unlike domain events, they carry enough state for the consumer to process
 * the event without calling back to the producer (Event Carried-State Transfer).
 *
 * Integration events are persisted to the outbox table and dispatched
 * asynchronously by the outbox processor to the configured message broker.
 *
 * @template TPayload - The shape of the event data. Should contain all information
 *                      the consumer needs so it never has to call back to the producer.
 *
 * @example
 * ```typescript
 * interface UserRegisteredPayload {
 *   userId: string;
 *   name: string;
 *   email: string;
 * }
 *
 * export class UserRegisteredIntegrationEvent extends IntegrationEvent<UserRegisteredPayload> {
 *   static readonly EVENT_NAME = 'user.registered';
 *
 *   constructor(payload: UserRegisteredPayload) {
 *     super(UserRegisteredIntegrationEvent.EVENT_NAME, payload);
 *   }
 * }
 * ```
 */
export abstract class IntegrationEvent<TPayload extends object = object> {
  /** Unique event identifier (UUID v4). */
  public readonly eventId: string;

  /** Timestamp when the event was created. */
  public readonly occurredOn: Date;

  /**
   * Stable, language-agnostic event name used as the message broker topic
   * and outbox identifier. Use dot-notation: `<module>.<action>`.
   *
   * Examples: 'user.registered', 'order.placed', 'payment.completed'
   */
  public readonly eventName: string;

  /**
   * The full event payload (Event Carried-State Transfer).
   * Contains all data the consumer needs — no need to call back to the producer.
   */
  public readonly payload: Readonly<TPayload>;

  protected constructor(eventName: string, payload: TPayload) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.eventName = eventName;
    this.payload = Object.freeze({ ...payload });
  }
}
