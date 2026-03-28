import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Shared pagination input DTO.
 *
 * Use this as a base or mixin in query DTOs that support pagination.
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   list(@Query() pagination: PaginationInputDto) { ... }
 * }
 * ```
 */
export class PaginationInputDto {
  /** Page number (1-indexed). Defaults to 1. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Number of items per page. Defaults to 20. Max 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/**
 * Shared paginated response DTO.
 *
 * Wraps a list of items with pagination metadata.
 *
 * @template T - The type of items in the response.
 */
export class PaginatedResponseDto<T> {
  /** Items for the current page. */
  data: T[];
  /** Total number of items across all pages. */
  total: number;
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  limit: number;
  /** Total number of pages. */
  totalPages: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
