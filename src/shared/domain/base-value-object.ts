/**
 * Base class for value objects.
 *
 * Value objects are defined by their attributes, not by an identity.
 * Two value objects with the same properties are considered equal.
 * They are immutable — once created, their state cannot change.
 *
 * @template TProps - The type of the value object's properties.
 *
 * @example
 * ```typescript
 * interface EmailProps {
 *   value: string;
 * }
 *
 * class Email extends BaseValueObject<EmailProps> {
 *   get value(): string { return this.props.value; }
 *
 *   static create(email: string): Email {
 *     Guard.againstNullOrUndefined(email, 'email');
 *     Guard.isValidEmail(email, 'email');
 *     return new Email({ value: email.toLowerCase().trim() });
 *   }
 * }
 * ```
 */
export abstract class BaseValueObject<TProps extends object> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  /**
   * Structural equality. Two value objects are equal if all their properties match.
   */
  equals(other?: BaseValueObject<TProps>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  /**
   * Returns a frozen plain-object representation of the value object's properties.
   * Useful for serialization and debugging.
   */
  toObject(): Readonly<TProps> {
    return this.props;
  }
}
