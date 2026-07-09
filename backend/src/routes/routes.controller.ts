import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private service: RoutesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

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
