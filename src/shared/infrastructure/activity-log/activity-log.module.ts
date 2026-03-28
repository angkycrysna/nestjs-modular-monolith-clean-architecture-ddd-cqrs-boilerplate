import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ACTIVITY_LOGGER } from '@shared/application/interfaces/activity-logger.interface';
import { ActivityLogOrmEntity } from './activity-log.orm-entity';
import { ActivityLogService } from './activity-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLogOrmEntity])],
  providers: [{ provide: ACTIVITY_LOGGER, useClass: ActivityLogService }],
  exports: [ACTIVITY_LOGGER],
})
export class ActivityLogModule {}
