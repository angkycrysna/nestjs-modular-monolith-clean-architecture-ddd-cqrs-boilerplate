import { randomUUID } from 'crypto';

/**
 * Base class for all domain entities.
 *
 * Entities are defined by their identity (id), not by their attributes.
 * Two entities with the same id are considered equal, regardless of other properties.
 *
 * @template TProps - The type of the entity's properties (excluding id/timestamps).
 *
 * @example
 * ```typescript
 * interface UserProps {
 *   name: string;
 *   email: Email; // value object
 * }
 *
 * class User extends BaseEntity<UserProps> {
 *   get name(): string { return this.props.name; }
 *   get email(): Email { return this.props.email; }
 *
 *   static create(props: UserProps): User {
 *     return new User(props);
 *   }
 * }
 * ```
 */
export abstract class BaseEntity<TProps extends object> {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  protected readonly props: TProps;

  protected constructor(
    props: TProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this._id = id ?? randomUUID();
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
    this.props = props;
  }

  /** Unique identifier (UUID v4). */
  get id(): string {
    return this._id;
  }

  /** Timestamp when the entity was first created. */
  get createdAt(): Date {
    return this._createdAt;
  }

  /** Timestamp of the last modification. Updated by calling `markUpdated()`. */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Call this in any method that mutates entity state.
   * The infrastructure layer uses this value for the `updated_at` column.
   */
  protected markUpdated(): void {
    this._updatedAt = new Date();
  }

  /**
   * Identity-based equality. Two entities with the same id are considered equal,
   * regardless of their other properties.
   */
  equals(other?: BaseEntity<TProps>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this._id === other._id;
  }
}
