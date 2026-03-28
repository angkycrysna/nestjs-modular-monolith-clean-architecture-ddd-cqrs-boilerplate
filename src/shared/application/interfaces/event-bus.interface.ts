import { DomainEvent } from '@shared/domain/domain-event';
import { IntegrationEvent } from '@shared/domain/integration-event';

/** Injection token for the event bus. */
export const EVENT_BUS = Symbol('EVENT_BUS');

/**
 * Event bus port — publishes domain and integration events.
 *
 * The application layer uses this to fire events without knowing how they
 * are dispatched (in-process, message broker, outbox, etc.).
 *
 * - **Domain events**: Internal to the module. Dispatched in-process.
 * - **Integration events**: Cross-module. Persisted to outbox and dispatched
 *   asynchronously via the configured message broker.
 *
 * @example
 * ```typescript
 * @Inject(EVENT_BUS) private readonly eventBus: IEventBus
 *
 * await this.eventBus.publishDomainEvent(new UserCreatedEvent(user.id));
 * await this.eventBus.publishIntegrationEvent(new UserRegisteredIntegrationEvent({ ... }));
 * ```
 */
export interface IEventBus {
  /** Publish a domain event (in-process, same module). */
  publishDomainEvent(event: DomainEvent): Promise<void>;

  /** Publish multiple domain events (e.g., all events from an aggregate). */
  publishDomainEvents(events: DomainEvent[]): Promise<void>;

  /**
   * Publish an integration event (cross-module).
   * The implementation should persist the event to the outbox table
   * so it can be dispatched reliably by the outbox processor.
   */
  publishIntegrationEvent(event: IntegrationEvent): Promise<void>;
}
