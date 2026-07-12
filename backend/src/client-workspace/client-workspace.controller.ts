import { Controller, Get, Post, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ClientWorkspaceService } from './client-workspace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('client-workspace')
@UseGuards(JwtAuthGuard)
export class ClientWorkspaceController {
  constructor(private readonly service: ClientWorkspaceService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    // The user's ID is in req.user.sub and clientId in req.user.clientId (if added)
    return this.service.getProfile(req.user.sub);
  }

  @Get('products')
  async getProducts() {
    return this.service.getProducts();
  }

  @Get('active-order')
  async getActiveOrder(@Req() req: any) {
    return this.service.getActiveOrder(req.user.sub);
  }

  @Get('orders')
  async getOrderHistory(@Req() req: any) {
    return this.service.getOrderHistory(req.user.sub);
  }

  @Get('orders/last')
  async getLastOrder(@Req() req: any) {
    return this.service.getLastOrder(req.user.sub);
  }

  @Post('orders')
  async createOrder(@Req() req: any, @Body() body: any) {
    return this.service.createOrder(req.user.sub, body.items, body.paymentMethod, body.address);
  }
}
