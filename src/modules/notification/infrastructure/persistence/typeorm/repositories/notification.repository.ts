import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseTypeOrmRepository } from '@shared/infrastructure/persistence/typeorm/base-typeorm.repository';
import type { INotificationRepository } from '@notification/domain/interfaces';
import { Notification } from '@notification/domain/entities';
import { NotificationOrmEntity } from '@notification/infrastructure/persistence/typeorm/entities';
import { NotificationMapper } from '@notification/infrastructure/persistence/typeorm/mappers/notification.mapper';

@Injectable()
export class NotificationRepository
  extends BaseTypeOrmRepository<Notification, NotificationOrmEntity>
  implements INotificationRepository
{
  constructor(
    @InjectRepository(NotificationOrmEntity)
    repo: Repository<NotificationOrmEntity>,
  ) {
    super(repo, NotificationMapper.toDomain, NotificationMapper.toOrm);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const orms = await this.ormRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(this.toDomain);
  }
}
