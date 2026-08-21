import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseTypeOrmRepository } from '@shared/infrastructure/persistence/typeorm/base-typeorm.repository';
import type { IUserRepository } from '@user/domain/interfaces';
import { User } from '@user/domain/entities';
import { UserOrmEntity } from '@user/infrastructure/persistence/typeorm/entities';
import { UserMapper } from '@user/infrastructure/persistence/typeorm/mappers/user.mapper';

@Injectable()
export class UserRepository
  extends BaseTypeOrmRepository<User, UserOrmEntity>
  implements IUserRepository
{
  constructor(
    @InjectRepository(UserOrmEntity)
    repo: Repository<UserOrmEntity>,
  ) {
    super(repo, UserMapper.toDomain, UserMapper.toOrm);
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.ormRepo.findOne({ where: { email } });
    return orm ? this.toDomain(orm) : null;
  }
}
