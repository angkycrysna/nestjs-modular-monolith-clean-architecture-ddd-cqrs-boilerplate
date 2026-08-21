import { Controller, Get, Param } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '@notification/notification.constants';
import type { INotificationRepository } from '@notification/domain/interfaces';
import { NotificationResponseDto } from '@notification/application/dtos';

@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {}

  @Get('user/:userId')
  async getByUserId(
    @Param('userId') userId: string,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepo.findByUserId(userId);

    return notifications.map((n) =>
      NotificationResponseDto.from({
        id: n.id,
        userId: n.userId,
        userName: n.userName,
        type: n.type,
        title: n.title,
        body: n.body,
        createdAt: n.createdAt,
      }),
    );
  }
}
