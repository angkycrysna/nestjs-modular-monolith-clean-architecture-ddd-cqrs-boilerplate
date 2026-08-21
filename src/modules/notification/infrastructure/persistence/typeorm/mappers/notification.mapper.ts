import { Notification, NotificationType } from '@notification/domain/entities';
import { NotificationOrmEntity } from '@notification/infrastructure/persistence/typeorm/entities';

export class NotificationMapper {
  static toDomain(this: void, orm: NotificationOrmEntity): Notification {
    return Notification.reconstitute(
      orm.id,
      {
        userId: orm.userId,
        userName: orm.userName,
        type: orm.type as NotificationType,
        title: orm.title,
        body: orm.body,
      },
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(this: void, domain: Notification): NotificationOrmEntity {
    const orm = new NotificationOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.userName = domain.userName;
    orm.type = domain.type;
    orm.title = domain.title;
    orm.body = domain.body;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
