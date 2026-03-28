import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EVENT_BUS } from '@shared/application/interfaces/event-bus.interface';
import { MESSAGE_BROKER } from '@shared/application/interfaces/message-broker.interface';
import { OUTBOX_REPOSITORY } from '@shared/application/interfaces/outbox-repository.interface';
import { EventBusService } from './event-bus.service';
import { NoopMessageBroker } from './noop-message-broker';
import { OutboxOrmEntity } from './outbox/outbox.orm-entity';
import { OutboxRepository } from './outbox/outbox.repository';
import { OutboxProcessorService } from './outbox/outbox-processor.service';

/**
 * Messaging module — provides event bus, outbox pattern, and message broker.
 *
 * Exports:
 * - EVENT_BUS      → EventBusService (in-process domain events + outbox integration events)
 * - MESSAGE_BROKER → NoopMessageBroker (swap to KafkaMessageBroker for Kafka or RabbitMqMessageBroker for RabbitMQ by changing useClass)
 *
 * The outbox processor runs as a cron job via @nestjs/schedule.
 */
@Module({
  imports: [
    CqrsModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([OutboxOrmEntity]),
  ],
  providers: [
    { provide: OUTBOX_REPOSITORY, useClass: OutboxRepository },
    { provide: MESSAGE_BROKER, useClass: NoopMessageBroker },
    { provide: EVENT_BUS, useClass: EventBusService },
    OutboxProcessorService,
  ],
  exports: [EVENT_BUS, MESSAGE_BROKER, CqrsModule],
})
export class MessagingModule {}
