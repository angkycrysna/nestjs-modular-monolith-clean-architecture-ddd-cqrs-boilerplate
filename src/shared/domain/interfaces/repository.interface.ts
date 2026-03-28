/**
 * Pagination options for repository queries.
 */
export interface PaginationOptions {
  /** Page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  limit: number;
}

/**
 * Paginated result wrapper.
 */
export interface PaginatedResult<T> {
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
}

/**
 * Generic repository interface (port).
 *
 * Defines the standard CRUD contract that any persistence adapter must implement.
 * The domain and application layers depend on this interface — they never know
 * whether data is stored in PostgreSQL, MongoDB, or any other database.
 *
 * Each module creates a specific repository interface that extends this base
 * with domain-specific query methods.
 *
 * @template T - The domain entity type this repository manages.
 *
 * @example
 * ```typescript
 * // In domain/interfaces/user-repository.interface.ts
 * export interface IUserRepository extends IRepository<User> {
 *   findByEmail(email: string): Promise<User | null>;
 * }
 * ```
 */
export interface IRepository<T> {
  /** Find an entity by its unique identifier. Returns null if not found. */
  findById(id: string): Promise<T | null>;

  /** Find all entities, optionally paginated. */
  findAll(pagination?: PaginationOptions): Promise<PaginatedResult<T>>;

  /** Persist a new entity or update an existing one. */
  save(entity: T): Promise<T>;

  /** Remove an entity by its unique identifier. */
  delete(id: string): Promise<void>;
}
