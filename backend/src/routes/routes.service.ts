import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PointStatus, RouteStatus } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.deliveryRoute.findMany({
      include: { driver: { select: { id: true, name: true } }, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.deliveryRoute.findUnique({ where: { id }, include: { driver: true, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: true } } } });
  }

  async create(data: { name: string; driverId?: number; loadItems?: { productId: number; quantity: number }[]; points?: { storeName: string; time?: string; totalSum?: number }[] }) {
    return this.prisma.deliveryRoute.create({
      data: {
        name: data.name,
        driverId: data.driverId,
        loadItems: data.loadItems ? { create: data.loadItems } : undefined,
        points: data.points ? { create: data.points.map((p, i) => ({ ...p, sortOrder: i })) } : undefined,
      },
      include: { driver: true, points: true, loadItems: { include: { product: true } } },
    });
  }

  async updatePointStatus(routeId: number, pointId: number, status: string) {
    return this.prisma.routePoint.update({ where: { id: pointId }, data: { status: status as PointStatus } });
  }

  async updateRouteStatus(id: number, status: string) {
    return this.prisma.deliveryRoute.update({ where: { id }, data: { status: status as RouteStatus } });
  }
}
