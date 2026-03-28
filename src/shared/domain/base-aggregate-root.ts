import { BaseEntity } from './base-entity';
import { DomainEvent } from './domain-event';

/**
 * Base class for aggregate roots.
 *
 * An aggregate root is the entry point for a cluster of domain objects (aggregate).
 * It guarantees transactional consistency within the aggregate boundary and
 * collects domain events that are dispatched after the aggregate is persisted.
 *
 * Domain events are collected via `addDomainEvent()` and cleared after persistence
 * by calling `clearDomainEvents()`. The infrastructure layer (repository or event bus)
 * is responsible for dispatching and clearing events.
 *
 * @template TProps - The type of the aggregate's properties.
 *
 * @example
 * ```typescript
 * class User extends BaseAggregateRoot<UserProps> {
 *   static create(props: UserProps): User {
 *     const user = new User(props);
 *     user.addDomainEvent(new UserCreatedEvent(user.id, props.name, props.email.value));
 *     return user;
 *   }
 * }
 * ```
 */
export abstract class BaseAggregateRoot<
  TProps extends object,
> extends BaseEntity<TProps> {
  private _domainEvents: DomainEvent[] = [];

  /** Returns a readonly copy of the pending domain events. */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents];
  }

  /**
   * Adds a domain event to the aggregate's pending events.
   * Events are dispatched after the aggregate is successfully persisted.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clears all pending domain events.
   * Called by the infrastructure layer after events have been dispatched.
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
