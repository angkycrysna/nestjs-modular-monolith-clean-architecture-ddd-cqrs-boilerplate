import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OUTBOX_REPOSITORY } from '@shared/application/interfaces/outbox-repository.interface';
import type { IOutboxRepository } from '@shared/application/interfaces/outbox-repository.interface';
import { MESSAGE_BROKER } from '@shared/application/interfaces/message-broker.interface';
import type { IMessageBroker } from '@shared/application/interfaces/message-broker.interface';

/**
 * Outbox processor — background job that dispatches pending integration events.
 *
 * Runs every 5 seconds (configurable). For each pending event:
 * 1. Fetches a batch of pending events (atomically sets status to 'processing').
 * 2. Publishes each event to the message broker using the event name as topic.
 * 3. Marks as 'published' on success, or records the error on failure.
 *
 * If retryCount >= maxRetries, the event is marked as 'failed' and requires
 * manual intervention (dashboard, alerting, dead-letter queue, etc.).
 */
@Injectable()
export class OutboxProcessorService {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private readonly batchSize = 50;

  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepo: IOutboxRepository,
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutbox(): Promise<void> {
    const events = await this.outboxRepo.fetchPending(this.batchSize);

    if (events.length === 0) return;

    this.logger.log(`Processing ${events.length} outbox event(s)`);

    for (const event of events) {
      try {
        await this.messageBroker.publish(event.eventName, event.payload);
        await this.outboxRepo.markPublished(event.id);
        this.logger.debug(
          `Published outbox event: ${event.eventName} (${event.id})`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await this.outboxRepo.markFailed(event.id, errorMessage);
        this.logger.error(
          `Failed to publish outbox event: ${event.eventName} (${event.id}) — ${errorMessage}`,
        );
      }
    }
  }
}
