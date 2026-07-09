import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pos')
@UseGuards(JwtAuthGuard)
export class PosController {
  constructor(private service: PosService) {}

  @Post('shift/open')
  openShift(@Body() dto: { userId: number; startCash: number }) {
    return this.service.openShift(dto.userId, dto.startCash);
  }

  @Post('shift/:id/close')
  closeShift(@Param('id', ParseIntPipe) id: number) {
    return this.service.closeShift(id);
  }

  @Get('shift/active')
  getActiveShift(@Query('userId') userId: string) {
    return this.service.getActiveShift(parseInt(userId));
  }

  @Get('shift/:id/summary')
  getShiftSummary(@Param('id', ParseIntPipe) id: number) {
    return this.service.getShiftSummary(id);
  }

  @Post('sale')
  createSale(@Body() dto: { shiftId: number; userId: number; paymentMethod: string; items: { productId: number; quantity: number; price: number }[] }) {
    return this.service.createSale(dto);
  }
}
