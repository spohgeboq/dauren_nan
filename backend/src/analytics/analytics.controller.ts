import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('summary')
  getSummary() { return this.service.getSummary(); }

  @Get('stats')
  getStats(@Query('period') period: string) {
    return this.service.getStats(period);
  }
}
