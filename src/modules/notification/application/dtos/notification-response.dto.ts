export class NotificationResponseDto {
  id!: string;
  userId!: string;
  userName!: string;
  type!: string;
  title!: string;
  body!: string;
  createdAt!: Date;

  static from(props: {
    id: string;
    userId: string;
    userName: string;
    type: string;
    title: string;
    body: string;
    createdAt: Date;
  }): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = props.id;
    dto.userId = props.userId;
    dto.userName = props.userName;
    dto.type = props.type;
    dto.title = props.title;
    dto.body = props.body;
    dto.createdAt = props.createdAt;
    return dto;
  }
}
