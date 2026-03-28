import {
  Repository,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';
import {
  IRepository,
  PaginationOptions,
  PaginatedResult,
} from '@shared/domain/interfaces/repository.interface';

/**
 * Generic TypeORM repository implementing the IRepository port.
 *
 * Each module creates a concrete repository that extends this base and adds
 * domain-specific query methods. The mapper functions convert between
 * domain entities and ORM entities so the domain stays persistence-agnostic.
 *
 * To swap to a different database (e.g., Prisma, Mongoose), create a new
 * base repository implementing IRepository — no changes to domain/application.
 *
 * @template TDomain - The domain entity type.
 * @template TOrm - The TypeORM ORM entity type.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository
 *   extends BaseTypeOrmRepository<User, UserOrmEntity>
 *   implements IUserRepository
 * {
 *   constructor(@InjectRepository(UserOrmEntity) repo: Repository<UserOrmEntity>) {
 *     super(repo, UserMapper.toDomain, UserMapper.toOrm);
 *   }
 *
 *   async findByEmail(email: string): Promise<User | null> {
 *     const orm = await this.ormRepo.findOne({ where: { email } });
 *     return orm ? this.toDomain(orm) : null;
 *   }
 * }
 * ```
 */
export abstract class BaseTypeOrmRepository<
  TDomain,
  TOrm extends ObjectLiteral,
> implements IRepository<TDomain> {
  constructor(
    protected readonly ormRepo: Repository<TOrm>,
    protected readonly toDomain: (orm: TOrm) => TDomain,
    protected readonly toOrm: (domain: TDomain) => TOrm,
  ) {}

  async findById(id: string): Promise<TDomain | null> {
    const where = { id } as unknown as FindOptionsWhere<TOrm>;
    const orm = await this.ormRepo.findOne({ where });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<TDomain>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [ormEntities, total] = await this.ormRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' } as unknown as FindOptionsOrder<TOrm>,
    });

    return {
      data: ormEntities.map(this.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(entity: TDomain): Promise<TDomain> {
    const orm = this.toOrm(entity);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }
}
