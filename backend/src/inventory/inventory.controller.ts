import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, CheckPermissions } from '../auth/guards/permissions.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermissions('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('stats')
  getStats() { return this.service.getStats(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Post('adjust')
  adjust(@Body() dto: { rawMaterialId: number; type: 'AUDIT' | 'WRITE_OFF'; amount: number; reason?: string }) {
    return this.service.adjust(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
