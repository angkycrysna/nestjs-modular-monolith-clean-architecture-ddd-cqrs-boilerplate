import { ICommand } from '@nestjs/cqrs';

/**
 * Shared audit context that every command carries.
 * Used by command handlers for activity logging and request tracing.
 */
export interface CommandContext {
  correlationId: string;
  performedBy: string | null;
  performedByName: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Base command class with built-in audit context.
 *
 * All commands should extend this so handlers always have access
 * to who performed the action, correlation ID, and request metadata.
 *
 * @example
 * ```typescript
 * export class CreateUserCommand extends BaseCommand {
 *   constructor(
 *     public readonly name: string,
 *     public readonly email: string,
 *     context: CommandContext,
 *   ) {
 *     super(context);
 *   }
 * }
 * ```
 */
export abstract class BaseCommand implements ICommand {
  public readonly correlationId: string;
  public readonly performedBy: string | null;
  public readonly performedByName: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;

  protected constructor(context: CommandContext) {
    this.correlationId = context.correlationId;
    this.performedBy = context.performedBy;
    this.performedByName = context.performedByName;
    this.ipAddress = context.ipAddress;
    this.userAgent = context.userAgent;
  }
}
