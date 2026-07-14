import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PointStatus, RouteStatus } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll(date?: string) {
    const where: any = {};
    if (date) {
      if (date === 'Сегодня') {
        const d = new Date();
        where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
      } else if (date === 'Вчера') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
      } else if (date === 'Завтра') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
      } else {
        const d = new Date(date);
        where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
      }
    }
    return this.prisma.deliveryRoute.findMany({
      where,
      include: { driver: { select: { id: true, name: true } }, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.deliveryRoute.findUnique({ where: { id }, include: { driver: true, points: { orderBy: { sortOrder: 'asc' } }, loadItems: { include: { product: true } } } });
  }

  async createWithAutoLoad(data: { name: string; driverId: number; date: string; clientIds: number[] }) {
    let dateStart, dateEnd;
    
    if (data.date === 'Сегодня') {
      const d = new Date();
      dateStart = new Date(d.setHours(0, 0, 0, 0));
      dateEnd = new Date(d.setHours(23, 59, 59, 999));
    } else if (data.date === 'Завтра') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      dateStart = new Date(d.setHours(0, 0, 0, 0));
      dateEnd = new Date(d.setHours(23, 59, 59, 999));
    } else {
      const d = new Date(data.date);
      dateStart = new Date(d.setHours(0, 0, 0, 0));
      dateEnd = new Date(d.setHours(23, 59, 59, 999));
    }

    const orders = await this.prisma.deliveryOrder.findMany({
      where: {
        clientId: { in: data.clientIds },
        createdAt: { gte: dateStart, lt: dateEnd },
        status: { in: ['PENDING', 'IN_TRANSIT', 'DELIVERED'] }
      },
      include: {
        client: true,
        items: true
      }
    });

    const pointsData: any[] = [];
    orders.forEach(order => {
      pointsData.push({
        clientId: order.clientId,
        storeName: order.client?.name || order.clientName,
        totalSum: order.totalAmount,
        status: 'PENDING',
        sortOrder: pointsData.length
      });
    });

    const clientsWithOrders = orders.map(o => o.clientId);
    const missingClientIds = data.clientIds.filter(id => !clientsWithOrders.includes(id));
    if (missingClientIds.length > 0) {
      const missingClients = await this.prisma.client.findMany({ where: { id: { in: missingClientIds } } });
      missingClients.forEach(c => {
        pointsData.push({
          clientId: c.id,
          storeName: c.name,
          totalSum: 0,
          status: 'PENDING',
          sortOrder: pointsData.length
        });
      });
    }

    const productCounts: Record<number, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.productId]) productCounts[item.productId] = 0;
        productCounts[item.productId] += item.quantity;
      });
    });

    const loadItemsData = Object.keys(productCounts).map(prodId => ({
      productId: Number(prodId),
      quantity: productCounts[Number(prodId)]
    }));

    // Update DeliveryOrders to assign this driver
    await this.prisma.deliveryOrder.updateMany({
      where: {
        id: { in: orders.map(o => o.id) }
      },
      data: {
        driverId: data.driverId
      }
    });

    return this.prisma.deliveryRoute.create({
      data: {
        name: data.name,
        driverId: data.driverId,
        date: dateStart,
        points: { create: pointsData },
        loadItems: { create: loadItemsData },
      },
      include: { driver: true, points: true, loadItems: { include: { product: true } } }
    });
  }

  async updatePointStatus(routeId: number, pointId: number, status: string) {
    return this.prisma.routePoint.update({ where: { id: pointId }, data: { status: status as PointStatus } });
  }

  async updateRouteStatus(id: number, status: string) {
    return this.prisma.deliveryRoute.update({ where: { id }, data: { status: status as RouteStatus } });
  }
}
