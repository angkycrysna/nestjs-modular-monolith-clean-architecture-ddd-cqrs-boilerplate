import { Entity, Column, Index } from 'typeorm';
import { BaseTypeOrmEntity } from '@shared/infrastructure/persistence/typeorm/base-typeorm.entity';
import { NOTIFICATION_DB_SCHEMA } from '@notification/notification.constants';

@Entity({ name: 'notifications', schema: NOTIFICATION_DB_SCHEMA })
export class NotificationOrmEntity extends BaseTypeOrmEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'user_name' })
  userName!: string;

  @Column()
  type!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  body!: string;
}
