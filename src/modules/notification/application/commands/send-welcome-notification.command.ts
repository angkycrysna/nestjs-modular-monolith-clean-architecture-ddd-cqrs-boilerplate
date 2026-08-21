import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BaseCommand,
  type CommandContext,
} from '@shared/application/base-command';
import {
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@shared/application/interfaces/unit-of-work.interface';
import {
  ACTIVITY_LOGGER,
  type IActivityLogger,
} from '@shared/application/interfaces/activity-logger.interface';
import {
  NOTIFICATION_REPOSITORY,
  NOTIFICATION_ACTIONS,
  NOTIFICATION_TARGETS,
} from '@notification/notification.constants';
import type { INotificationRepository } from '@notification/domain/interfaces';
import { Notification, NotificationType } from '@notification/domain/entities';
import { NotificationResponseDto } from '@notification/application/dtos';

// Command
export class SendWelcomeNotificationCommand extends BaseCommand {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly userEmail: string,
    context: CommandContext,
  ) {
    super(context);
  }
}

// Handler
@CommandHandler(SendWelcomeNotificationCommand)
export class SendWelcomeNotificationCommandHandler implements ICommandHandler<
  SendWelcomeNotificationCommand,
  NotificationResponseDto
> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(ACTIVITY_LOGGER)
    private readonly activityLogger: IActivityLogger,
  ) {}

  async execute(
    command: SendWelcomeNotificationCommand,
  ): Promise<NotificationResponseDto> {
    const notification = Notification.create({
      userId: command.userId,
      userName: command.userName,
      type: NotificationType.WELCOME,
      title: 'Welcome!',
      body: `Hi ${command.userName}, welcome to the platform!`,
    });

    // All-or-nothing: save notification + activity log
    const saved = await this.unitOfWork.execute(async () => {
      const persisted = await this.notificationRepo.save(notification);

      await this.activityLogger.log({
        action: NOTIFICATION_ACTIONS.welcome.sent,
        actorId: null,
        actorName: 'System',
        module: 'notification',
        note: `Welcome notification sent to ${command.userName}`,
        targetId: persisted.id,
        targetTable: NOTIFICATION_TARGETS.notifications,
        oldData: null,
        newData: {
          userId: persisted.userId,
          userName: persisted.userName,
          type: persisted.type,
        },
        correlationId: command.correlationId,
      });

      return persisted;
    });

    return NotificationResponseDto.from({
      id: saved.id,
      userId: saved.userId,
      userName: saved.userName,
      type: saved.type,
      title: saved.title,
      body: saved.body,
      createdAt: saved.createdAt,
    });
  }
}
