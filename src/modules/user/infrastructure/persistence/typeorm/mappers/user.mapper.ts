import { User } from '@user/domain/entities';
import { UserOrmEntity } from '@user/infrastructure/persistence/typeorm/entities';

export class UserMapper {
  static toDomain(this: void, orm: UserOrmEntity): User {
    return User.reconstitute(
      orm.id,
      orm.name,
      orm.email,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(this: void, domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.email = domain.email.value;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
