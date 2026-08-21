import { Inject } from '@nestjs/common';
import { QueryHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '@shared/application/exceptions/application-exception';
import { ERROR_CODES } from '@shared/application/exceptions/error-codes';
import { USER_REPOSITORY } from '@user/user.constants';
import type { IUserRepository } from '@user/domain/interfaces';
import { UserResponseDto } from '@contracts/user';

// Query
export class GetUserByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

// Handler
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserResponseDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(query.id);

    if (!user) {
      throw new ApplicationException(
        ERROR_CODES.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return UserResponseDto.from({
      id: user.id,
      name: user.name,
      email: user.email.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
