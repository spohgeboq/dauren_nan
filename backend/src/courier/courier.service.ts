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
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.deliveryOrder.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Заказ не найден');

      // Map status string to DeliveryOrderStatus enum
      let mappedStatus: DeliveryOrderStatus = DeliveryOrderStatus.PENDING;
      if (status === 'IN_TRANSIT') mappedStatus = DeliveryOrderStatus.IN_TRANSIT;
      if (status === 'DELIVERED') mappedStatus = DeliveryOrderStatus.DELIVERED;
      if (status === 'CANCELLED') mappedStatus = DeliveryOrderStatus.CANCELLED;

      const newPaymentMethod = paymentMethod || order.paymentMethod;

      // Determine B2B debt state transitions
      const wasDebtDelivered = order.status === DeliveryOrderStatus.DELIVERED && order.paymentMethod === 'DEBT';
      const isDebtDelivered = mappedStatus === DeliveryOrderStatus.DELIVERED && newPaymentMethod === 'DEBT';

      // Update the order status
      await tx.deliveryOrder.update({
        where: { id: orderId },
        data: {
          status: mappedStatus,
          paymentMethod: newPaymentMethod,
          isPaid: mappedStatus === DeliveryOrderStatus.DELIVERED ? true : order.isPaid,
        },
      });

      // Update client balance if needed
      if (order.clientId) {
        if (!wasDebtDelivered && isDebtDelivered) {
          await tx.client.update({
            where: { id: order.clientId },
            data: { balance: { decrement: order.totalAmount } },
          });
        } else if (wasDebtDelivered && !isDebtDelivered) {
          await tx.client.update({
            where: { id: order.clientId },
            data: { balance: { increment: order.totalAmount } },
          });
        }
      }

      return { success: true };
    });
  }
}
