import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { USER_REPOSITORY } from '@user/user.constants';
import { CreateUserCommandHandler } from '@user/application/commands';
import {
  GetUserByIdQueryHandler,
  GetUsersQueryHandler,
} from '@user/application/queries';
import { UserOrmEntity } from '@user/infrastructure/persistence/typeorm/entities';
import { UserRepository } from '@user/infrastructure/persistence/typeorm/repositories/user.repository';
import { UserController } from '@user/presentation/controllers/user.controller';

const commandHandlers = [CreateUserCommandHandler];
const queryHandlers = [GetUserByIdQueryHandler, GetUsersQueryHandler];

@Module({
  imports: [
    SharedModule,
    CqrsModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],
  controllers: [UserController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
})
export class UserModule {}
