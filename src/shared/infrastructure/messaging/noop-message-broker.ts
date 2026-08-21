import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IMessageBroker } from '@shared/application/interfaces/message-broker.interface';

/**
 * In-process message broker — default for monolith mode.
 *
 * Emits events via EventEmitter2 so @OnEvent() handlers in other modules
 * receive integration events without an external broker.
 *
 * When switching to Kafka/RabbitMQ:
 *   1. Swap DI in messaging.module.ts: { provide: MESSAGE_BROKER, useClass: KafkaMessageBroker }
 *   2. Replace @OnEvent() handlers with broker-specific consumers
 */
@Injectable()
export class NoopMessageBroker implements IMessageBroker {
  private readonly logger = new Logger(NoopMessageBroker.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(topic: string, message: string): Promise<void> {
    this.logger.debug(`Published to "${topic}" (in-process)`);
    this.eventEmitter.emit(
      topic,
      JSON.parse(message) as Record<string, unknown>,
    );
    return Promise.resolve();
  }

  subscribe(
    topic: string,
    _handler: (message: string) => Promise<void>,
  ): Promise<void> {
    this.logger.debug(
      `Subscribe to "${topic}" — not needed in monolith (use @OnEvent instead)`,
    );
    void _handler;
    return Promise.resolve();
  }
}
