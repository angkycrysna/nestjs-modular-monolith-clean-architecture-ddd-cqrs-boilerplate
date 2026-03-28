import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IOutboxRepository,
  OutboxEvent,
  OutboxEventStatus,
} from '@shared/application/interfaces/outbox-repository.interface';
import { OutboxOrmEntity } from './outbox.orm-entity';

@Injectable()
export class OutboxRepository implements IOutboxRepository {
  constructor(
    @InjectRepository(OutboxOrmEntity)
    private readonly repo: Repository<OutboxOrmEntity>,
  ) {}

  async store(
    event: Pick<OutboxEvent, 'id' | 'eventName' | 'payload' | 'occurredOn'> & {
      maxRetries?: number;
      metadata?: Record<string, unknown> | null;
    },
  ): Promise<void> {
    const entity = this.repo.create({
      id: event.id,
      eventName: event.eventName,
      payload: event.payload,
      occurredOn: event.occurredOn,
      maxRetries: event.maxRetries ?? 5,
      metadata: event.metadata ?? null,
    });
    await this.repo.save(entity);
  }

  async fetchPending(limit: number): Promise<OutboxEvent[]> {
    // Atomically claim pending events by setting status to 'processing'.
    // This prevents multiple processor instances from dispatching the same event.
    const pending = await this.repo.find({
      where: { status: OutboxEventStatus.PENDING as OutboxOrmEntity['status'] },
      order: { occurredOn: 'ASC' },
      take: limit,
    });

    if (pending.length === 0) return [];

    const ids = pending.map((e) => e.id);
    await this.repo
      .createQueryBuilder()
      .update(OutboxOrmEntity)
      .set({
        status: OutboxEventStatus.PROCESSING as OutboxOrmEntity['status'],
      })
      .whereInIds(ids)
      .execute();

    return pending.map((e) => ({
      id: e.id,
      eventName: e.eventName,
      payload: e.payload,
      occurredOn: e.occurredOn,
      status: OutboxEventStatus.PROCESSING,
      publishedAt: e.publishedAt,
      retryCount: e.retryCount,
      maxRetries: e.maxRetries,
      lastError: e.lastError,
      metadata: e.metadata,
    }));
  }

  async markPublished(id: string): Promise<void> {
    await this.repo.update(id, {
      status: OutboxEventStatus.PUBLISHED as OutboxOrmEntity['status'],
      publishedAt: new Date(),
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    const event = await this.repo.findOneByOrFail({ id });
    const newRetryCount = event.retryCount + 1;
    const newStatus =
      newRetryCount >= event.maxRetries
        ? OutboxEventStatus.FAILED
        : OutboxEventStatus.PENDING; // Back to pending for retry

    await this.repo.update(id, {
      retryCount: newRetryCount,
      lastError: error,
      status: newStatus as OutboxOrmEntity['status'],
    });
  }
}
