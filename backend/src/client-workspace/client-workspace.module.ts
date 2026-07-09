import { Module } from '@nestjs/common';
import { ClientWorkspaceController } from './client-workspace.controller';
import { ClientWorkspaceService } from './client-workspace.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientWorkspaceController],
  providers: [ClientWorkspaceService],
})
export class ClientWorkspaceModule {}
