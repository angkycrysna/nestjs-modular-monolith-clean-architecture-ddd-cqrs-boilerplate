import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import {
  PaginationInputDto,
  PaginatedResponseDto,
} from '@shared/application/dtos/pagination.dto';
import { buildCommandContext } from '@shared/presentation/helpers/request-context.helper';
import { CreateUserCommand } from '@user/application/commands';
import { GetUserByIdQuery, GetUsersQuery } from '@user/application/queries';
import { CreateUserDto } from '@user/application/dtos';
import { UserResponseDto } from '@contracts/user';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    return this.commandBus.execute(
      new CreateUserCommand(dto.name, dto.email, buildCommandContext(req)),
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Get()
  async list(
    @Query() pagination: PaginationInputDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.queryBus.execute(
      new GetUsersQuery(pagination.page, pagination.limit),
    );
  }
}
