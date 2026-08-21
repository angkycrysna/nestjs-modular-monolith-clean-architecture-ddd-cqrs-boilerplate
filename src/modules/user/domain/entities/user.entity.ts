import { BaseAggregateRoot } from '@shared/domain/base-aggregate-root';
import { Guard } from '@shared/domain/guard';
import { DomainException } from '@shared/domain/exceptions/domain-exception';
import { ERROR_CODES } from '@shared/application/exceptions/error-codes';
import { Email } from '@user/domain/value-objects';
import { UserCreatedEvent } from '@user/domain/events';

interface UserProps {
  name: string;
  email: Email;
}

export class User extends BaseAggregateRoot<UserProps> {
  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  /**
   * Factory method — the only way to create a new User.
   * Validates invariants and raises a domain event.
   */
  static create(name: string, email: string): User {
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(name, 'name'),
      Guard.againstEmpty(name, 'name'),
      Guard.lengthBetween(name, 2, 100, 'name'),
    ]);

    if (!guardResult.succeeded) {
      throw new DomainException(ERROR_CODES.VALIDATION_FAILED, {
        field: 'name',
        reason: guardResult.message,
      });
    }

    const emailVO = Email.create(email);
    const user = new User({ name: name.trim(), email: emailVO });

    user.addDomainEvent(
      new UserCreatedEvent(user.id, user.name, emailVO.value),
    );

    return user;
  }

  /**
   * Reconstitute from persistence — no validation, no events.
   * Used by the mapper when loading from the database.
   */
  static reconstitute(
    id: string,
    name: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    const emailVO = Email.reconstitute(email);
    const user = new User({ name, email: emailVO }, id, createdAt, updatedAt);
    return user;
  }
}
