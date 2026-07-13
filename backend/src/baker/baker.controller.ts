import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BakerService } from './baker.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('baker')
@UseGuards(JwtAuthGuard)
export class BakerController {
  constructor(private service: BakerService) {}

  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboard();
  }

  @Post('batch/start')
  startBatch(@Body() body: { productId: number; quantity: number; bakerId: number }) {
    return this.service.startBatch(body.productId, body.quantity, body.bakerId);
  }

  @Post('batch/finish')
  finishBatch(@Body() body: { batchId: number }) {
    return this.service.finishBatch(body.batchId);
  }

  @Post('defect')
  recordDefect(@Body() body: { productId: number; quantity: number; reason?: string; bakerId: number }) {
    return this.service.recordDefect(body.productId, body.quantity, body.reason || '', body.bakerId);
  }

  @Post('order/ready')
  markB2bOrderReady(@Body() body: { orderId: number }) {
    return this.service.markB2bOrderReady(body.orderId);
  }

  @Post('showcase/log')
  logShowcaseBatch(@Body() body: { productId: number; quantity: number; bakerId: number }) {
    return this.service.logShowcaseBatch(body.productId, body.quantity, body.bakerId);
  }
}
