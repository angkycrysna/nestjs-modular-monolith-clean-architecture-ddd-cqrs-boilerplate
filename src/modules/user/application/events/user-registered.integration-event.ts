import { IntegrationEvent } from '@shared/domain/integration-event';

interface UserRegisteredPayload {
  userId: string;
  name: string;
  email: string;
  correlationId: string;
}

export class UserRegisteredIntegrationEvent extends IntegrationEvent<UserRegisteredPayload> {
  static readonly EVENT_NAME = 'user.registered';

  constructor(payload: UserRegisteredPayload) {
    super(UserRegisteredIntegrationEvent.EVENT_NAME, payload);
  }
}
