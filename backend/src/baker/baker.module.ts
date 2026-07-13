import { Module } from '@nestjs/common';
import { BakerController } from './baker.controller';
import { BakerService } from './baker.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [BakerController],
  providers: [BakerService],
})
export class BakerModule {}
