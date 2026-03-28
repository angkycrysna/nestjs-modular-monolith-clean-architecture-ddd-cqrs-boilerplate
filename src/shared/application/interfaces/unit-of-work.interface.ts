/** Injection token for the unit of work. */
export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

/**
 * Unit of Work port — manages a database transaction boundary.
 *
 * Use this when an operation spans multiple repository writes that must
 * succeed or fail together. The application layer starts a transaction,
 * performs writes through repositories, and commits or rolls back.
 *
 * The implementation is database-specific (TypeORM QueryRunner, Prisma $transaction, etc.)
 * but the application layer only knows this interface.
 *
 * @example
 * ```typescript
 * const uow = this.unitOfWork;
 *
 * await uow.begin();
 * try {
 *   await this.orderRepo.save(order, uow);
 *   await this.inventoryRepo.reserve(items, uow);
 *   await uow.commit();
 * } catch (error) {
 *   await uow.rollback();
 *   throw error;
 * } finally {
 *   await uow.release();
 * }
 * ```
 */
export interface IUnitOfWork {
  /** Start a new transaction. Must be called before any writes. */
  begin(): Promise<void>;

  /** Commit the transaction. All writes become permanent. */
  commit(): Promise<void>;

  /** Rollback the transaction. All writes are discarded. */
  rollback(): Promise<void>;

  /**
   * Release the underlying connection back to the pool.
   * Must ALWAYS be called in a `finally` block, even after rollback.
   */
  release(): Promise<void>;

  /**
   * Execute a callback within a transaction.
   * Automatically handles begin, commit, rollback, and release.
   * Preferred over manual begin/commit/rollback for most use cases.
   *
   * @param work - The transactional work to execute.
   * @returns The result of the work callback.
   */
  execute<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Returns the underlying transaction context (e.g., TypeORM QueryRunner).
   * Used by repository implementations to participate in the transaction.
   * Returns undefined if no transaction is active.
   */
  getTransactionContext(): unknown;
}
