import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(date?: string) {
    const where: any = {};
    if (date) {
      const d = new Date(date);
      where.deliveryDate = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(d.setHours(23, 59, 59, 999)) };
    }
    return this.prisma.order.findMany({
      where,
      include: { client: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id }, include: { client: true, items: { include: { product: true } } } });
  }

  async create(data: { clientId: number; deliveryTime?: string; items: { productId: number; quantity: number; price: number }[] }) {
    const total = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    return this.prisma.order.create({
      data: {
        clientId: data.clientId,
        deliveryTime: data.deliveryTime,
        total,
        items: { create: data.items },
      },
      include: { items: { include: { product: true } }, client: true },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status: status as OrderStatus } });
  }

  async getStats() {
    const total = await this.prisma.order.count();
    const pending = await this.prisma.order.count({ where: { status: 'NEW' } });
    const orders = await this.prisma.order.findMany({ where: { status: { not: 'CANCELLED' } } });
    const totalSum = orders.reduce((sum, o) => sum + o.total, 0);
    return { totalOrders: total, pendingOrders: pending, totalSum };
  }

  async findAllDeliveries() {
    return this.prisma.deliveryOrder.findMany({
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        driver: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignDriver(id: number, driverId: number | null) {
    return this.prisma.deliveryOrder.update({
      where: { id },
      data: { driverId },
      include: { driver: { select: { id: true, name: true } } }
    });
  }
}
