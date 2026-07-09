import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.purchase.findMany({ include: { items: true }, orderBy: { date: 'desc' } });
  }

  async create(data: { supplier?: string; totalSum?: number; items: { name: string; orderedQty: number; unit: string; inventoryItemId?: number }[] }) {
    return this.prisma.purchase.create({
      data: { supplier: data.supplier, totalSum: data.totalSum || 0, items: { create: data.items } },
      include: { items: true },
    });
  }

  async receive(id: number) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id }, include: { items: true } });
    if (!purchase) return null;

    // Update inventory for each item
    for (const item of purchase.items) {
      if (item.inventoryItemId) {
        const inv = await this.prisma.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (inv) {
          await this.prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { currentStock: inv.currentStock + item.orderedQty * inv.conversionRatio },
          });
        }
      }
    }

    return this.prisma.purchase.update({ where: { id }, data: { status: 'DELIVERED' as PurchaseStatus } });
  }

  async getNeeds() {
    const items = await this.prisma.inventoryItem.findMany({ where: { currentStock: { lt: this.prisma.inventoryItem.fields?.minLimit as any } } });
    // Fallback: get all and filter in code
    const all = await this.prisma.inventoryItem.findMany();
    return all.filter(i => i.currentStock < i.minLimit).map(i => ({
      id: i.id, name: i.name, currentStock: i.currentStock, minLimit: i.minLimit,
      recommendedQty: Math.ceil((i.minLimit - i.currentStock) / (i.conversionRatio || 1)),
      unit: i.purchaseUnit,
    }));
  }
}
