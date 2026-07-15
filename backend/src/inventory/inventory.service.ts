import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    return this.prisma.rawMaterial.findUnique({ where: { id } });
  }

  async create(data: { name: string; unit?: string; costPerUnit?: number; minLimit?: number }) {
    return this.prisma.rawMaterial.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.rawMaterial.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryAdjustment.deleteMany({ where: { rawMaterialId: id } });
      await tx.purchaseItem.deleteMany({ where: { rawMaterialId: id } });
      await tx.recipeIngredient.deleteMany({ where: { rawMaterialId: id } });
      return tx.rawMaterial.delete({ where: { id } });
    });
  }

  async adjust(data: { rawMaterialId: number; type: 'AUDIT' | 'WRITE_OFF'; amount: number; reason?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const rm = await tx.rawMaterial.findUnique({ where: { id: data.rawMaterialId } });
      if (!rm) throw new BadRequestException('Сырье не найдено');

      const amountDecimal = new Decimal(data.amount);
      const costPerUnit = Number(rm.costPerUnit);
      const totalLoss = Math.abs(data.amount) * costPerUnit;

      // Create an expense record for the loss
      const expense = await tx.expense.create({
        data: {
          category: 'INVENTORY_LOSS',
          description: `Списание/Инвентаризация: ${rm.name}. Причина: ${data.reason || 'Не указана'}`,
          amount: totalLoss,
          // @ts-ignore
          isAuto: true
        }
      });

      // Log adjustment
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          rawMaterialId: data.rawMaterialId,
          type: data.type,
          amount: amountDecimal,
          reason: data.reason,
          expenseId: expense.id
        }
      });

      // Update stock
      const updatedRm = await tx.rawMaterial.update({
        where: { id: data.rawMaterialId },
        data: {
          stock: { increment: amountDecimal }
        }
      });

      return { adjustment, newStock: updatedRm.stock };
    });
  }

  async getStats() {
    const items = await this.prisma.rawMaterial.findMany();
    const total = items.length;
    const critical = items.filter(i => Number(i.stock) < Number(i.minLimit)).length;
    const totalValue = items.reduce((sum, i) => sum + Number(i.stock) * Number(i.costPerUnit), 0);
    return { totalItems: total, criticalItems: critical, totalValue };
  }
}
