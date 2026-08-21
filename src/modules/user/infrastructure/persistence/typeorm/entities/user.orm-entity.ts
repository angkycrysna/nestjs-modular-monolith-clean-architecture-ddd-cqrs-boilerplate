import { Entity, Column } from 'typeorm';
import { BaseTypeOrmEntity } from '@shared/infrastructure/persistence/typeorm/base-typeorm.entity';
import { USER_DB_SCHEMA } from '@user/user.constants';

@Entity({ name: 'users', schema: USER_DB_SCHEMA })
export class UserOrmEntity extends BaseTypeOrmEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;
}
