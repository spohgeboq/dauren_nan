import { Module } from '@nestjs/common';
import { BakerController } from './baker.controller';
import { BakerService } from './baker.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BakerController],
  providers: [BakerService],
})
export class BakerModule {}
