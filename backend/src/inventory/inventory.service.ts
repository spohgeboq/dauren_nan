import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({ where: { id } });
  }

  async create(data: { name: string; currentStock?: number; minLimit?: number; costPerUnit?: number; baseUnit?: string; purchaseUnit?: string; conversionRatio?: number }) {
    return this.prisma.inventoryItem.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async getStats() {
    const items = await this.prisma.inventoryItem.findMany();
    const total = items.length;
    const critical = items.filter(i => i.currentStock < i.minLimit).length;
    const totalValue = items.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
    return { totalItems: total, criticalItems: critical, totalValue };
  }
}
