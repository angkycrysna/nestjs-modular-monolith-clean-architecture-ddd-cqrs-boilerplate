import type { ActivityAction } from '../activity/define-module-actions';

/** Injection token for the activity logger. */
export const ACTIVITY_LOGGER = Symbol('ACTIVITY_LOGGER');

/**
 * Shape of an activity log entry.
 *
 * Designed for production auditing — every entry answers:
 * WHO did WHAT to WHICH record, WHEN, and WHAT changed.
 */
export interface ActivityLogEntry {
  /**
   * Dot-notation action identifier: `<module>.<resource>.<verb>`
   * Must be generated via `defineModuleActions()` — never write raw strings.
   *
   * Format enforced at compile time:
   *   - module:   singular (e.g., 'user', 'order')
   *   - resource: snake_case (e.g., 'profile', 'family_member')
   *   - verb:     past tense (e.g., 'created', 'updated', 'added')
   *
   * @example USER_ACTIONS.profile.created → 'user.profile.created'
   */
  action: ActivityAction;

  // WHO
  /** ID of the user who performed the action (null for system actions). */
  actorId: string | null;
  /** Display name of the actor (e.g., 'John Doe', 'System', 'Scheduler'). */
  actorName: string;

  // WHAT
  /** The module that owns this action (e.g., 'user', 'order'). Use Singular form. */
  module: string;
  /** Human-readable description of the action (e.g., 'User John Doe was created'). */
  note: string;

  // WHICH
  /** ID of the affected entity (e.g., user profile ID, order ID). */
  targetId: string | null;
  /** Table name of the affected entity (e.g., 'user_profiles', 'orders'). Use snake_case. */
  targetTable: string | null;

  // WHAT CHANGED
  /** Previous state of the entity (null for create operations). */
  oldData: Record<string, unknown> | null;
  /** New state of the entity (null for delete operations). */
  newData: Record<string, unknown> | null;

  // CONTEXT
  /** Correlation ID for request tracing. */
  correlationId: string;
  /** IP address of the requester (if available). */
  ipAddress?: string;
  /** User agent of the requester (if available). */
  userAgent?: string;
}

/**
 * Activity logger port — records auditable actions.
 *
 * Every command handler should log its execution through this interface.
 * This creates an immutable audit trail of all write operations that can
 * be queried via API and displayed on the frontend.
 *
 * @example
 * ```typescript
 * @Inject(ACTIVITY_LOGGER) private readonly activityLogger: IActivityLogger
 *
 * // Create
 * await this.activityLogger.log({
 *   action: 'user.profile.created',
 *   actorId: command.performedBy,
 *   actorName: 'John Doe',
 *   module: 'user',
 *   note: 'User John Doe was created',
 *   targetId: user.id,
 *   targetTable: 'users',
 *   oldData: null,
 *   newData: { name: 'John Doe', email: 'john@example.com' },
 *   correlationId: command.correlationId,
 * });
 *
 * // Update
 * await this.activityLogger.log({
 *   action: 'user.profile.updated',
 *   actorId: command.performedBy,
 *   actorName: 'Jane Admin',
 *   module: 'user',
 *   note: 'User email was updated',
 *   targetId: user.id,
 *   targetTable: 'users',
 *   oldData: { email: 'old@example.com' },
 *   newData: { email: 'new@example.com' },
 *   correlationId: command.correlationId,
 * });
 * ```
 */
export interface IActivityLogger {
  /** Record an activity log entry. */
  log(entry: ActivityLogEntry): Promise<void>;
}
