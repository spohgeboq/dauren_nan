import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Get()
  findAll(@Query('category') category?: string, @Query('month') month?: string) { return this.service.findAll(category, month); }

  @Get('stats')
  getStats(@Query('month') month?: string) { return this.service.getStats(month); }

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }
}
