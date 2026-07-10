import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, CheckPermissions } from '../auth/guards/permissions.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermissions('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  findAll(@Query('date') date?: string) { return this.service.findAll(date); }

  @Get('stats')
  getStats() { return this.service.getStats(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: { clientId: number; deliveryTime?: string; items: { productId: number; quantity: number; price: number }[] }) {
    return this.service.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Get('deliveries')
  findAllDeliveries() {
    return this.service.findAllDeliveries();
  }

  @Patch('deliveries/:id/assign-driver')
  assignDriver(@Param('id', ParseIntPipe) id: number, @Body('driverId') driverId: number | null) {
    // Body will contain driverId which might be a number or null
    const parsedDriverId = driverId === null ? null : Number(driverId);
    return this.service.assignDriver(id, parsedDriverId);
  }
}
