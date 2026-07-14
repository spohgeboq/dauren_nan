import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, CheckPermissions } from '../auth/guards/permissions.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermissions('routes')
export class RoutesController {
  constructor(private service: RoutesService) {}

  @Get()
  findAll(@Query('date') date?: string) { return this.service.findAll(date); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: { name: string; driverId: number; date: string; clientIds: number[] }) {
    return this.service.createWithAutoLoad(dto);
  }

  @Patch(':id/status')
  updateRouteStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateRouteStatus(id, status);
  }

  @Patch(':routeId/points/:pointId/status')
  updatePointStatus(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('pointId', ParseIntPipe) pointId: number,
    @Body('status') status: string,
  ) {
    return this.service.updatePointStatus(routeId, pointId, status);
  }
}
