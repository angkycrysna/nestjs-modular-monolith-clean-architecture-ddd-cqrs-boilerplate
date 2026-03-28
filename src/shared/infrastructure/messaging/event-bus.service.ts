import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DomainEvent } from '@shared/domain/domain-event';
import { IntegrationEvent } from '@shared/domain/integration-event';
import { IEventBus } from '@shared/application/interfaces/event-bus.interface';
import { OUTBOX_REPOSITORY } from '@shared/application/interfaces/outbox-repository.interface';
import type { IOutboxRepository } from '@shared/application/interfaces/outbox-repository.interface';

/**
 * In-process event bus implementation.
 *
 * - Domain events: Dispatched synchronously via @nestjs/cqrs EventBus.
 * - Integration events: Persisted to the outbox table for reliable
 *   async delivery by the OutboxProcessor.
 */
@Injectable()
export class EventBusService implements IEventBus {
  constructor(
    private readonly cqrsEventBus: EventBus,
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepo: IOutboxRepository,
  ) {}

  publishDomainEvent(event: DomainEvent): Promise<void> {
    this.cqrsEventBus.publish(event);
    return Promise.resolve();
  }

  publishDomainEvents(events: DomainEvent[]): Promise<void> {
    this.cqrsEventBus.publishAll(events);
    return Promise.resolve();
  }

  async publishIntegrationEvent(
    event: IntegrationEvent,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.outboxRepo.store({
      id: event.eventId,
      eventName: event.eventName,
      payload: JSON.stringify(event.payload),
      occurredOn: event.occurredOn,
      metadata: metadata ?? null,
    });
  }
}
