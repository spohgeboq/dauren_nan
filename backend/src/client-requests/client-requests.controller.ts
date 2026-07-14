import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ClientRequestsService } from './client-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('client-requests')
export class ClientRequestsController {
  constructor(private readonly service: ClientRequestsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.approve(id, dto);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.service.reject(id);
  }
}
