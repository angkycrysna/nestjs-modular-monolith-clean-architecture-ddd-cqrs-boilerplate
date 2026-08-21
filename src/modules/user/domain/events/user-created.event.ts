import { DomainEvent } from '@shared/domain/domain-event';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly email: string,
  ) {
    super(aggregateId);
  }
}
