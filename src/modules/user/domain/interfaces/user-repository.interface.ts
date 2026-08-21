import type { IRepository } from '@shared/domain/interfaces/repository.interface';
import type { User } from '@user/domain/entities';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
