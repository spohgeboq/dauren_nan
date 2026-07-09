import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryOrderStatus } from '@prisma/client';

@Injectable()
export class CourierService {
  constructor(private prisma: PrismaService) {}

  async getOrders(driverId: number) {
    const orders = await this.prisma.deliveryOrder.findMany({
      where: {
        driverId,
        status: { in: [DeliveryOrderStatus.PENDING, DeliveryOrderStatus.IN_TRANSIT] },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { orders };
  }

  async updateOrderStatus(orderId: number, status: string, paymentMethod?: string) {
    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Заказ не найден');

    // Map status string to DeliveryOrderStatus enum
    let mappedStatus: DeliveryOrderStatus = DeliveryOrderStatus.PENDING;
    if (status === 'IN_TRANSIT') mappedStatus = DeliveryOrderStatus.IN_TRANSIT;
    if (status === 'DELIVERED') mappedStatus = DeliveryOrderStatus.DELIVERED;
    if (status === 'CANCELLED') mappedStatus = DeliveryOrderStatus.CANCELLED;

    await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: {
        status: mappedStatus,
        paymentMethod: paymentMethod || order.paymentMethod,
        isPaid: status === 'DELIVERED' ? true : order.isPaid,
      },
    });

    return { success: true };
  }
}
