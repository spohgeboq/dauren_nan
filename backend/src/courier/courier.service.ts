import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryOrderStatus } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CourierService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

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

      // Handle Automatic Income if DELIVERED and NOT DEBT
      const wasDeliveredAndPaid = order.status === DeliveryOrderStatus.DELIVERED && order.paymentMethod !== 'DEBT';
      const isDeliveredAndPaid = mappedStatus === DeliveryOrderStatus.DELIVERED && newPaymentMethod !== 'DEBT';

      if (!wasDeliveredAndPaid && isDeliveredAndPaid) {
        // Decide mapped PaymentMethod for Income
        // Delivery uses "CASH", "CARD", "QR", "DEBT"
        const mappedIncomeMethod = newPaymentMethod === 'CASH' ? 'CASH' : 'KASPI';
        
        await tx.income.create({
          data: {
            amount: order.totalAmount,
            paymentMethod: mappedIncomeMethod,
            source: 'DELIVERY',
            description: `Оплата за доставку (Заказ #${order.id}, ${order.clientName})`,
            isAuto: true,
            userId: order.driverId,
          }
        });
      }

      // Sync with RoutePoint if exists
      if (order.clientId) {
        // Find the active route point for this client
        const activeRoutePoint = await tx.routePoint.findFirst({
          where: {
            clientId: order.clientId,
            route: {
              driverId: order.driverId,
              status: { not: 'COMPLETED' }
            }
          },
          orderBy: { id: 'desc' }
        });

        if (activeRoutePoint) {
          let pointStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED' = 'PENDING';
          if (mappedStatus === 'DELIVERED') pointStatus = 'DELIVERED';
          if (mappedStatus === 'CANCELLED') pointStatus = 'CANCELLED';

          await tx.routePoint.update({
            where: { id: activeRoutePoint.id },
            data: { status: pointStatus }
          });
        }
      }

      // Эмитим событие через WebSockets
      this.eventsGateway.broadcastOrderStatusUpdate(orderId, mappedStatus);

      return { success: true };
    });
  }
}
