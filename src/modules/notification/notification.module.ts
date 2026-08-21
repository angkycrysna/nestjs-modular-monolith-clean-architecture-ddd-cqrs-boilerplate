import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { NOTIFICATION_REPOSITORY } from '@notification/notification.constants';
import { SendWelcomeNotificationCommandHandler } from '@notification/application/commands';
import { OnUserRegisteredHandler } from '@notification/application/events';
import { NotificationOrmEntity } from '@notification/infrastructure/persistence/typeorm/entities';
import { NotificationRepository } from '@notification/infrastructure/persistence/typeorm/repositories/notification.repository';
import { NotificationController } from '@notification/presentation/controllers/notification.controller';

const commandHandlers = [SendWelcomeNotificationCommandHandler];
const eventHandlers = [OnUserRegisteredHandler];

@Module({
  imports: [
    SharedModule,
    CqrsModule,
    TypeOrmModule.forFeature([NotificationOrmEntity]),
  ],
  controllers: [NotificationController],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepository },
  ],
})
export class NotificationModule {}
