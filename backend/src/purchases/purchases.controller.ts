import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, CheckPermissions } from '../auth/guards/permissions.guard';

@Controller('purchases')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermissions('purchases')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('needs')
  getNeeds() { return this.service.getNeeds(); }

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id/receive')
  receive(@Param('id', ParseIntPipe) id: number) { return this.service.receive(id); }

  @Get('suppliers')
  getSuppliers() { return this.service.getSuppliers(); }

  @Post('suppliers')
  createSupplier(@Body() dto: any) { return this.service.createSupplier(dto); }

  @Post('suppliers/:id/pay')
  paySupplier(@Param('id', ParseIntPipe) id: number, @Body() dto: { amount: number; paymentMethod?: string }) { 
    return this.service.paySupplier(id, dto.amount, dto.paymentMethod); 
  }
}
