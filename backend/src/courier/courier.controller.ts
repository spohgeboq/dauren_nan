import { Controller, Get, Post, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { CourierService } from './courier.service';

@Controller('courier')
export class CourierController {
  constructor(private service: CourierService) {}

  @Get('orders')
  getOrders(@Query('driverId', ParseIntPipe) driverId: number) {
    return this.service.getOrders(driverId);
  }

  @Post('order/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; paymentMethod?: string },
  ) {
    return this.service.updateOrderStatus(id, body.status, body.paymentMethod);
  }
}
