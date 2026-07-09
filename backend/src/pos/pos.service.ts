import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  async openShift(userId: number, startCash: number) {
    // Close any existing open shift for this user
    await this.prisma.shift.updateMany({
      where: { userId, isOpen: true },
      data: { isOpen: false, closedAt: new Date() },
    });

    return this.prisma.shift.create({
      data: { userId, startCash, isOpen: true },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async closeShift(shiftId: number) {
    const sales = await this.prisma.sale.findMany({ where: { shiftId } });
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId } });

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: { isOpen: false, closedAt: new Date(), endCash: (shift?.startCash || 0) + totalSales },
    });
  }

  async createSale(data: { shiftId: number; userId: number; paymentMethod: string; items: { productId: number; quantity: number; price: number }[] }) {
    const total = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    return this.prisma.sale.create({
      data: {
        shiftId: data.shiftId,
        userId: data.userId,
        total,
        paymentMethod: data.paymentMethod as PaymentMethod,
        items: { create: data.items },
      },
      include: { items: { include: { product: { select: { id: true, name: true } } } } },
    });
  }

  async getActiveShift(userId: number) {
    return this.prisma.shift.findFirst({
      where: { userId, isOpen: true },
      include: { sales: { include: { items: true } } },
    });
  }

  async getShiftSummary(shiftId: number) {
    const sales = await this.prisma.sale.findMany({
      where: { shiftId },
      include: { items: { include: { product: true } } },
    });

    const totalCash = sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.total, 0);
    const totalKaspi = sales.filter(s => s.paymentMethod === 'KASPI').reduce((sum, s) => sum + s.total, 0);

    return {
      salesCount: sales.length,
      totalCash,
      totalKaspi,
      totalRevenue: totalCash + totalKaspi,
    };
  }
}
