import { BaseValueObject } from '@shared/domain/base-value-object';
import { Guard } from '@shared/domain/guard';
import { DomainException } from '@shared/domain/exceptions/domain-exception';
import { ERROR_CODES } from '@shared/application/exceptions/error-codes';

interface EmailProps {
  value: string;
}

export class Email extends BaseValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  static create(email: string): Email {
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(email, 'email'),
      Guard.againstEmpty(email, 'email'),
      Guard.isValidEmail(email, 'email'),
    ]);

    if (!guardResult.succeeded) {
      throw new DomainException(ERROR_CODES.INVALID_FORMAT, { field: 'email' });
    }

    return new Email({ value: email.toLowerCase().trim() });
  }

  /** Reconstitute from persistence — no validation. */
  static reconstitute(email: string): Email {
    return new Email({ value: email });
  }
}
