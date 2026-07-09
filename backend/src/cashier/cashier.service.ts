import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class CashierService {
  constructor(private prisma: PrismaService) {}

  async getProducts() {
    const products = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
    return { products };
  }

  async sell(cart: { productId: number; quantity: number; price: number }[], paymentMethod: string, cashierId: number) {
    let totalAmount = 0;
    const saleItems = cart.map((item) => {
      totalAmount += item.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      };
    });

    return this.prisma.$transaction(async (tx) => {
      // 1. Find or create an open shift for the cashier
      let activeShift = await tx.shift.findFirst({
        where: { userId: cashierId, isOpen: true },
      });
      if (!activeShift) {
        activeShift = await tx.shift.create({
          data: {
            userId: cashierId,
            startCash: 0,
            isOpen: true,
          },
        });
      }

      // 2. Map payment method enum (CASH or KASPI)
      let pm: PaymentMethod = PaymentMethod.CASH;
      if (paymentMethod.toUpperCase() === 'KASPI') {
        pm = PaymentMethod.KASPI;
      }

      // 3. Create sale
      const sale = await tx.sale.create({
        data: {
          shiftId: activeShift.id,
          userId: cashierId,
          total: totalAmount,
          paymentMethod: pm,
          items: {
            create: saleItems,
          },
        },
      });

      // 4. Decrement showcase stock of products
      for (const item of saleItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return { success: true, totalAmount, saleId: sale.id };
    });
  }
}
