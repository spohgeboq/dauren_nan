import { Controller, Get, Post, Body } from '@nestjs/common';
import { CashierService } from './cashier.service';

@Controller('cashier')
export class CashierController {
  constructor(private service: CashierService) {}

  @Get('products')
  getProducts() {
    return this.service.getProducts();
  }

  @Post('sell')
  sell(@Body() body: { cart: { productId: number; quantity: number; price: number }[]; paymentMethod: string; cashierId: number }) {
    return this.service.sell(body.cart, body.paymentMethod, body.cashierId);
  }
}
