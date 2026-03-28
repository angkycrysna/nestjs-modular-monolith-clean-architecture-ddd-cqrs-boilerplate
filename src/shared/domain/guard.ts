/**
 * Result of a guard check.
 */
export interface GuardResult {
  succeeded: boolean;
  message?: string;
}

/**
 * Domain guard — assertion helpers for enforcing domain invariants.
 *
 * Use these in entity factory methods and value object constructors
 * to validate input before creating domain objects. Guards return a result
 * rather than throwing, so you can aggregate multiple failures or decide
 * how to handle them.
 *
 * @example
 * ```typescript
 * class User extends BaseAggregateRoot<UserProps> {
 *   static create(props: CreateUserProps): User {
 *     const guardResult = Guard.combine([
 *       Guard.againstNullOrUndefined(props.name, 'name'),
 *       Guard.againstEmpty(props.name, 'name'),
 *       Guard.lengthBetween(props.name, 1, 100, 'name'),
 *     ]);
 *
 *     if (!guardResult.succeeded) {
 *       throw new DomainException(ERROR_CODES.VALIDATION_FAILED);
 *     }
 *
 *     return new User(props);
 *   }
 * }
 * ```
 */
export class Guard {
  /**
   * Asserts that a value is not null or undefined.
   */
  static againstNullOrUndefined(
    value: unknown,
    argumentName: string,
  ): GuardResult {
    if (value === null || value === undefined) {
      return { succeeded: false, message: `${argumentName} is required` };
    }
    return { succeeded: true };
  }

  /**
   * Asserts that a string is not empty (after trimming).
   */
  static againstEmpty(value: string, argumentName: string): GuardResult {
    if (value.trim().length === 0) {
      return {
        succeeded: false,
        message: `${argumentName} must not be empty`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Asserts that a string length is within a specified range (inclusive).
   */
  static lengthBetween(
    value: string,
    min: number,
    max: number,
    argumentName: string,
  ): GuardResult {
    const length = value.trim().length;
    if (length < min || length > max) {
      return {
        succeeded: false,
        message: `${argumentName} must be between ${min} and ${max} characters`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Asserts that a value matches a standard email format.
   */
  static isValidEmail(value: string, argumentName: string): GuardResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        succeeded: false,
        message: `${argumentName} is not a valid email format`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Asserts that a number is within a specified range (inclusive).
   */
  static inRange(
    value: number,
    min: number,
    max: number,
    argumentName: string,
  ): GuardResult {
    if (value < min || value > max) {
      return {
        succeeded: false,
        message: `${argumentName} must be between ${min} and ${max}`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Asserts that a value is one of the allowed values.
   */
  static isOneOf<T>(
    value: T,
    validValues: T[],
    argumentName: string,
  ): GuardResult {
    if (!validValues.includes(value)) {
      return {
        succeeded: false,
        message: `${argumentName} must be one of: ${validValues.join(', ')}`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Combines multiple guard results.
   * Returns the first failure, or a success if all pass.
   */
  static combine(results: GuardResult[]): GuardResult {
    for (const result of results) {
      if (!result.succeeded) return result;
    }
    return { succeeded: true };
  }
}
