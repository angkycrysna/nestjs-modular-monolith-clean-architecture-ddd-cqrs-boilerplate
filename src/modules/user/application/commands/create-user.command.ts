import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import {
  BaseCommand,
  type CommandContext,
} from '@shared/application/base-command';
import {
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@shared/application/interfaces/unit-of-work.interface';
import {
  EVENT_BUS,
  type IEventBus,
} from '@shared/application/interfaces/event-bus.interface';
import {
  ACTIVITY_LOGGER,
  type IActivityLogger,
} from '@shared/application/interfaces/activity-logger.interface';
import { ApplicationException } from '@shared/application/exceptions/application-exception';
import { ERROR_CODES } from '@shared/application/exceptions/error-codes';
import {
  USER_REPOSITORY,
  USER_ACTIONS,
  USER_TARGETS,
} from '@user/user.constants';
import type { IUserRepository } from '@user/domain/interfaces';
import { User } from '@user/domain/entities';
import { UserRegisteredIntegrationEvent } from '@user/application/events';
import { UserResponseDto } from '@contracts/user';

// Command
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    context: CommandContext,
  ) {
    super(context);
  }
}

// Handler
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<
  CreateUserCommand,
  UserResponseDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(EVENT_BUS)
    private readonly eventBus: IEventBus,
    @Inject(ACTIVITY_LOGGER)
    private readonly activityLogger: IActivityLogger,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    // Check for duplicate email
    const existing = await this.userRepo.findByEmail(command.email);
    if (existing) {
      throw new ApplicationException(
        ERROR_CODES.DUPLICATE_ENTRY,
        HttpStatus.CONFLICT,
        { field: 'email' },
      );
    }

    // Create domain aggregate (validates invariants, raises domain event)
    const user = User.create(command.name, command.email);

    // All-or-nothing: save user + persist outbox event + activity log
    const saved = await this.unitOfWork.execute(async () => {
      const persisted = await this.userRepo.save(user);

      // Integration event -> outbox (same transaction)
      await this.eventBus.publishIntegrationEvent(
        new UserRegisteredIntegrationEvent({
          userId: persisted.id,
          name: persisted.name,
          email: persisted.email.value,
          correlationId: command.correlationId,
        }),
      );

      // Activity log (same transaction)
      await this.activityLogger.log({
        action: USER_ACTIONS.profile.created,
        actorId: command.performedBy,
        actorName: command.performedByName,
        module: 'user',
        note: `User ${persisted.name} was created`,
        targetId: persisted.id,
        targetTable: USER_TARGETS.users,
        oldData: null,
        newData: { name: persisted.name, email: persisted.email.value },
        correlationId: command.correlationId,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
      });

      return persisted;
    });

    // Domain events dispatched after commit (in-process, not transactional)
    await this.eventBus.publishDomainEvents([...user.domainEvents]);
    user.clearDomainEvents();

    return UserResponseDto.from({
      id: saved.id,
      name: saved.name,
      email: saved.email.value,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }
}
