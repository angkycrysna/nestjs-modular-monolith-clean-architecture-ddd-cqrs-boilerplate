import { Injectable, Logger } from '@nestjs/common';
import { IMessageBroker } from '@shared/application/interfaces/message-broker.interface';

/**
 * No-op message broker — default for monolith mode.
 *
 * Logs published messages but does not dispatch to any external broker.
 * The outbox processor still marks events as published, maintaining
 * a consistent audit trail.
 *
 * To switch to a real broker, swap the DI binding in messaging.module.ts:
 *   { provide: MESSAGE_BROKER, useClass: KafkaMessageBroker }
 */
@Injectable()
export class NoopMessageBroker implements IMessageBroker {
  private readonly logger = new Logger(NoopMessageBroker.name);

  publish(topic: string, message: string): Promise<void> {
    this.logger.debug(
      `[Noop] Would publish to "${topic}": ${message.substring(0, 200)}`,
    );
    return Promise.resolve();
  }

  subscribe(
    topic: string,
    _handler: (message: string) => Promise<void>,
  ): Promise<void> {
    this.logger.debug(`[Noop] Would subscribe to "${topic}"`);
    void _handler;
    return Promise.resolve();
  }
}
