import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BakerService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const products = await this.prisma.product.findMany({
      include: { recipe: { include: { ingredients: true } } },
    });
    const rawMaterials = await this.prisma.rawMaterial.findMany();
    const activeBatches = await this.prisma.productionBatch.findMany({
      where: { status: 'IN_PROGRESS' },
      include: { product: true },
      orderBy: { startTime: 'desc' },
    });

    return { products, rawMaterials, activeBatches };
  }

  async startBatch(productId: number, quantity: number, bakerId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { recipe: { include: { ingredients: true } } },
    });

    if (!product) throw new NotFoundException('Продукт не найден');

    return this.prisma.$transaction(async (tx) => {
      // Create batch
      const batch = await tx.productionBatch.create({
        data: {
          productId,
          quantity,
          bakerId,
          status: 'IN_PROGRESS',
        },
      });

      // Decrement raw materials stock if recipe exists
      if (product.recipe) {
        for (const ing of product.recipe.ingredients) {
          const totalNeeded = (ing.quantity || ing.amount || 0) * quantity;
          await tx.rawMaterial.update({
            where: { id: ing.rawMaterialId },
            data: { stock: { decrement: totalNeeded } },
          });
        }
      }

      return { success: true, batch };
    });
  }

  async finishBatch(batchId: number) {
    const batch = await this.prisma.productionBatch.findUnique({ where: { id: batchId } });
    if (!batch || batch.status === 'COMPLETED') {
      throw new BadRequestException('Партия не найдена или уже завершена');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.productionBatch.update({
        where: { id: batchId },
        data: { status: 'COMPLETED', endTime: new Date() },
      });

      await tx.product.update({
        where: { id: batch.productId },
        data: { stock: { increment: batch.quantity } },
      });

      return { success: true };
    });
  }

  async recordDefect(productId: number, quantity: number, reason: string, bakerId: number) {
    const defect = await this.prisma.defectLog.create({
      data: { productId, quantity, reason, bakerId },
    });
    return { success: true, defect };
  }
}
