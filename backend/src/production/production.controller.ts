import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, CheckPermissions } from '../auth/guards/permissions.guard';

@Controller('production')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermissions('production')
export class ProductionController {
  constructor(private service: ProductionService) {}

  @Get('tasks')
  getTasks(@Query('date') date?: string) { return this.service.getTasks(date); }

  @Get('logs')
  getLogs(@Query('taskId') taskId?: string) { return this.service.getLogs(taskId ? parseInt(taskId) : undefined); }

  @Get('stats')
  getStats() { return this.service.getStats(); }

  @Post('tasks')
  createTask(@Body() dto: { productId: number; planned: number }) { return this.service.createTask(dto); }

  @Post('batch')
  addBatch(@Body() dto: { taskId: number; quantity: number; type: string }) { return this.service.addBatch(dto); }
}
