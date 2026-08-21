import { BaseEntity } from '@shared/domain/base-entity';

export enum NotificationType {
  WELCOME = 'welcome',
  GENERAL = 'general',
}

interface NotificationProps {
  userId: string;
  userName: string;
  type: NotificationType;
  title: string;
  body: string;
}

export class Notification extends BaseEntity<NotificationProps> {
  get userId(): string {
    return this.props.userId;
  }

  get userName(): string {
    return this.props.userName;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  static create(props: NotificationProps): Notification {
    return new Notification(props);
  }

  static reconstitute(
    id: string,
    props: NotificationProps,
    createdAt: Date,
    updatedAt: Date,
  ): Notification {
    return new Notification(props, id, createdAt, updatedAt);
  }
}
