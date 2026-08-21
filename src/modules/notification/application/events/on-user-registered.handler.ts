import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CommandBus } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { SendWelcomeNotificationCommand } from '@notification/application/commands';

/**
 * Handles the 'user.registered' integration event.
 *
 * This handler is triggered when the outbox processor dispatches
 * the UserRegisteredIntegrationEvent. It creates a welcome notification
 * without importing any User module files — fully decoupled.
 *
 * The event payload follows ECST — it carries all data needed
 * (userId, name, email) so no callback to User module is required.
 */
@Injectable()
export class OnUserRegisteredHandler {
  private readonly logger = new Logger(OnUserRegisteredHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent('user.registered')
  async handle(payload: {
    userId: string;
    name: string;
    email: string;
    correlationId: string;
  }): Promise<void> {
    this.logger.log(
      `Received user.registered event for ${payload.name} (${payload.userId})`,
    );

    await this.commandBus.execute(
      new SendWelcomeNotificationCommand(
        payload.userId,
        payload.name,
        payload.email,
        {
          correlationId: payload.correlationId ?? randomUUID(),
          performedBy: null,
          performedByName: 'System',
        },
      ),
    );
  }
}
