import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { IUnitOfWork } from '@shared/application/interfaces/unit-of-work.interface';

/**
 * TypeORM implementation of the Unit of Work pattern.
 *
 * Uses a QueryRunner to manage a database transaction. The QueryRunner
 * acquires a connection from the pool, starts a transaction, and either
 * commits or rolls back.
 *
 * IMPORTANT: Always call `release()` in a `finally` block to return
 * the connection to the pool. Prefer `execute()` for automatic lifecycle.
 *
 * @example
 * ```typescript
 * // Preferred: automatic lifecycle
 * const result = await this.unitOfWork.execute(async () => {
 *   await this.orderRepo.save(order);
 *   await this.inventoryRepo.reserve(items);
 *   return order;
 * });
 *
 * // Manual: when you need fine-grained control
 * await this.unitOfWork.begin();
 * try {
 *   await this.orderRepo.save(order);
 *   await this.unitOfWork.commit();
 * } catch {
 *   await this.unitOfWork.rollback();
 * } finally {
 *   await this.unitOfWork.release();
 * }
 * ```
 */
@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  private queryRunner: QueryRunner | undefined;

  constructor(private readonly dataSource: DataSource) {}

  async begin(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commit(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error('Transaction not started. Call begin() first.');
    }
    await this.queryRunner.commitTransaction();
  }

  async rollback(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error('Transaction not started. Call begin() first.');
    }
    await this.queryRunner.rollbackTransaction();
  }

  async release(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.release();
      this.queryRunner = undefined;
    }
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    await this.begin();
    try {
      const result = await work();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      await this.release();
    }
  }

  /**
   * Returns the active QueryRunner for repositories to participate
   * in the current transaction. Returns undefined if no transaction is active.
   */
  getTransactionContext(): QueryRunner | undefined {
    return this.queryRunner;
  }
}
