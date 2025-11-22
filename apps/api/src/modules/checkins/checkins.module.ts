import { Module } from '@nestjs/common';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { StreaksModule } from '../streaks/streaks.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [StreaksModule, EventsModule],
  controllers: [CheckinsController],
  providers: [CheckinsService],
  exports: [CheckinsService],
})
export class CheckinsModule {}
