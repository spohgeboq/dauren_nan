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

    // Check if a planned ProductionTask exists for the current day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const taskExists = await this.prisma.productionTask.findFirst({
      where: {
        productId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

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

      return { success: true, batch, hasPlannedTask: !!taskExists };
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

      // Automatically increment completed count in ProductionTask if a task exists for that day
      const dayStart = new Date(batch.startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(batch.startTime);
      dayEnd.setHours(23, 59, 59, 999);

      const task = await tx.productionTask.findFirst({
        where: {
          productId: batch.productId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (task) {
        await tx.productionTask.update({
          where: { id: task.id },
          data: { completed: { increment: batch.quantity } },
        });

        // Add to BatchLog as well
        const timeStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const product = await tx.product.findUnique({ where: { id: batch.productId } });
        await tx.batchLog.create({
          data: {
            taskId: task.id,
            time: timeStr,
            productName: product?.name || 'Партия',
            quantity: batch.quantity,
            type: 'READY',
          },
        });
      }

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
