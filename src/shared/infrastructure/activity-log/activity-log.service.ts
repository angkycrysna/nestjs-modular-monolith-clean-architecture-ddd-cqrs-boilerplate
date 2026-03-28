import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  IActivityLogger,
  ActivityLogEntry,
} from '@shared/application/interfaces/activity-logger.interface';
import { ActivityLogOrmEntity } from './activity-log.orm-entity';

/** Fields that should never appear in activity log data. */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'creditCard',
  'cvv',
  'ssn',
]);

/**
 * Recursively strips sensitive fields from an object.
 * Returns a new object — does not mutate the original.
 */
function sanitize(
  data: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!data) return null;

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key)) {
      cleaned[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitize(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

@Injectable()
export class ActivityLogService implements IActivityLogger {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLogOrmEntity)
    private readonly repo: Repository<ActivityLogOrmEntity>,
  ) {}

  async log(entry: ActivityLogEntry): Promise<void> {
    try {
      const entity = this.repo.create({
        action: entry.action,
        actorId: entry.actorId,
        actorName: entry.actorName,
        module: entry.module,
        note: entry.note,
        targetId: entry.targetId,
        targetTable: entry.targetTable,
        oldData: sanitize(entry.oldData),
        newData: sanitize(entry.newData),
        correlationId: entry.correlationId,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      });

      await this.repo.save(entity);
    } catch (error) {
      // Activity logging should never break the main flow.
      // Log the failure and continue.
      this.logger.error(
        `Failed to write activity log: ${entry.action}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
