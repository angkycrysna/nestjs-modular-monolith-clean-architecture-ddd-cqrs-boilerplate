import type { Request } from 'express';
import type { CommandContext } from '@shared/application/base-command';
import { CORRELATION_ID_HEADER } from '@shared/presentation/interceptors/correlation-id.interceptor';

/**
 * Extracts a CommandContext from the Express request.
 * Use this in every controller to avoid repeating the same extraction logic.
 *
 * @param req - The Express request object.
 * @param performedBy - User ID (null for unauthenticated / system actions).
 * @param performedByName - Display name of the actor (defaults to 'System').
 *
 * @example
 * ```typescript
 * @Post()
 * async create(@Body() dto: CreateUserDto, @Req() req: Request) {
 *   const context = buildCommandContext(req);
 *   return this.commandBus.execute(new CreateUserCommand(dto.name, dto.email, context));
 * }
 * ```
 */
export function buildCommandContext(
  req: Request,
  performedBy: string | null = null,
  performedByName: string = 'System',
): CommandContext {
  return {
    correlationId: req.headers[CORRELATION_ID_HEADER] as string,
    performedBy,
    performedByName,
    ipAddress: req.ip ?? undefined,
    userAgent: req.headers['user-agent'],
  };
}
