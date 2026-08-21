import type { IRepository } from '@shared/domain/interfaces/repository.interface';
import type { Notification } from '@notification/domain/entities';

export interface INotificationRepository extends IRepository<Notification> {
  findByUserId(userId: string): Promise<Notification[]>;
}
