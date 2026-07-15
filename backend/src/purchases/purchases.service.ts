import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.purchase.findMany({ 
      include: { items: true, supplier: true }, 
      orderBy: { date: 'desc' } 
    });
  }

  async create(data: { date?: string; supplierName?: string; totalSum?: number; items: { name: string; orderedQty: number; unit: string; rawMaterialId: number; price?: number }[]; isPaidRightNow?: boolean; paymentMethod?: string }) {
    const formattedItems = data.items.map(item => ({
      name: item.name,
      orderedQty: item.orderedQty,
      unit: item.unit,
      price: item.price || 0,
      rawMaterial: { connect: { id: item.rawMaterialId } }
    }));

    let supplierId = null;
    if (data.supplierName && data.supplierName.trim()) {
      const supplierName = data.supplierName.trim();
      const supplier = await this.prisma.supplier.upsert({
        where: { name: supplierName },
        update: {},
        create: { name: supplierName },
      });
      supplierId = supplier.id;
    }

    const purchase = await this.prisma.purchase.create({
      data: { 
        date: data.date ? new Date(data.date) : new Date(),
        supplierId, 
        totalSum: data.totalSum || 0, 
        items: { create: formattedItems } 
      },
      include: { items: true, supplier: true },
    });

    if (data.isPaidRightNow && data.totalSum) {
      if (supplierId) {
        // First receive the goods right away to add debt
        await this.receive(purchase.id);
        // Then pay the supplier
        await this.paySupplier(supplierId, data.totalSum, data.paymentMethod);
      } else {
        // Direct cash buy without supplier
        await this.prisma.expense.create({
          data: {
            category: 'INGREDIENTS',
            description: `Прямая закупка сырья (без поставщика)`,
            amount: data.totalSum,
            paymentMethod: (data.paymentMethod || 'CASH') as any,
            // @ts-ignore
            isAuto: true
          }
        });
        await this.receive(purchase.id);
      }
    }

    return purchase;
  }

  async receive(id: number) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id }, include: { items: true, supplier: true } });
    if (!purchase) return null;

    // 1. Update inventory and recalculate moving average cost
    for (const item of purchase.items) {
      if (item.rawMaterialId) {
        const rm = await this.prisma.rawMaterial.findUnique({ where: { id: item.rawMaterialId } });
        if (rm) {
          const oldStock = Number(rm.stock);
          const oldCost = Number(rm.costPerUnit);
          const addedStock = Number(item.orderedQty);
          const totalItemPrice = Number(item.price || 0);
          
          // item.price is the total price for this item row in the invoice
          const costPerNewUnit = addedStock > 0 ? totalItemPrice / addedStock : 0;

          let newCost = oldCost;
          if (oldStock + addedStock > 0 && totalItemPrice > 0) {
             // Moving average
             newCost = ((oldStock * oldCost) + totalItemPrice) / (oldStock + addedStock);
          } else if (totalItemPrice > 0) {
             newCost = costPerNewUnit;
          }

          await this.prisma.rawMaterial.update({
            where: { id: item.rawMaterialId },
            data: { 
              stock: { increment: addedStock },
              costPerUnit: newCost
            },
          });
        }
      }
    }

    // 2. Add debt to supplier
    if (purchase.supplierId && purchase.totalSum) {
      await this.prisma.supplier.update({
        where: { id: purchase.supplierId },
        data: { balance: { increment: purchase.totalSum } }
      });
    }

    return this.prisma.purchase.update({ where: { id }, data: { status: 'DELIVERED' as PurchaseStatus } });
  }

  // --- Supplier Logistics ---
  async getSuppliers() {
    return this.prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  }

  async createSupplier(data: { name: string; phone?: string }) {
    return this.prisma.supplier.create({ data });
  }

  async paySupplier(supplierId: number, amount: number, paymentMethod: string = 'CASH') {
    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct debt
      const supplier = await tx.supplier.update({
        where: { id: supplierId },
        data: { balance: { decrement: amount } }
      });

      // 2. Create Expense
      const expense = await tx.expense.create({
        data: {
          category: 'INGREDIENTS',
          description: `Оплата поставщику: ${supplier.name}`,
          amount: amount,
          paymentMethod: paymentMethod as any,
          // @ts-ignore
          isAuto: true
        }
      });

      // 3. Create Payment record
      await tx.supplierPayment.create({
        data: {
          supplierId,
          amount,
          expenseId: expense.id
        }
      });

      return supplier;
    });
  }

  async getNeeds() {
    const all = await this.prisma.rawMaterial.findMany();
    return all.filter(i => Number(i.stock) < Number(i.minLimit)).map(i => ({
      id: i.id, name: i.name, currentStock: i.stock, minLimit: i.minLimit,
      recommendedQty: Number(i.minLimit) - Number(i.stock),
      unit: i.unit,
    }));
  }
}
