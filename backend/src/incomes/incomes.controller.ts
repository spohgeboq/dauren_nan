import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomeSource, PaymentMethod } from '@prisma/client';

@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  create(@Body() body: { amount: number, paymentMethod: string, source?: string, description?: string }) {
    return this.incomesService.create({
      amount: body.amount,
      paymentMethod: (body.paymentMethod as PaymentMethod) || 'CASH',
      source: (body.source as IncomeSource) || 'MANUAL',
      description: body.description,
      isAuto: false,
    });
  }

  @Get()
  findAll(@Query('month') month?: string, @Query('source') source?: string) {
    return this.incomesService.findAll({ month, source: source as IncomeSource });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomesService.remove(+id);
  }
}
