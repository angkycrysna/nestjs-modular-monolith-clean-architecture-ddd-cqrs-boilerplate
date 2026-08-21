import { Inject } from '@nestjs/common';
import { QueryHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { PaginatedResponseDto } from '@shared/application/dtos/pagination.dto';
import { USER_REPOSITORY } from '@user/user.constants';
import type { IUserRepository } from '@user/domain/interfaces';
import { UserResponseDto } from '@contracts/user';

// Query
export class GetUsersQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}

// Handler
@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<
  GetUsersQuery,
  PaginatedResponseDto<UserResponseDto>
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    query: GetUsersQuery,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const result = await this.userRepo.findAll({
      page: query.page,
      limit: query.limit,
    });

    const items = result.data.map((user) =>
      UserResponseDto.from({
        id: user.id,
        name: user.name,
        email: user.email.value,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    );

    return new PaginatedResponseDto(
      items,
      result.total,
      result.page,
      result.limit,
    );
  }
}
