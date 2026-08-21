import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [SharedModule, UserModule, NotificationModule],
})
export class AppModule {}
