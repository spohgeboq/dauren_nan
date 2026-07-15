import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchType } from '@prisma/client';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  async getTasks(date?: string) {
    const where: any = {};
    if (date) {
      const d = new Date(date);
      where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(new Date(date).setHours(23, 59, 59, 999)) };
    }
    return this.prisma.productionTask.findMany({ where, include: { product: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async getLogs(taskId?: number) {
    const where: any = {};
    if (taskId) where.taskId = taskId;
    return this.prisma.batchLog.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createTask(data: { productId: number; planned: number }) {
    return this.prisma.productionTask.create({ data, include: { product: true } });
  }

  async updateTask(id: number, planned: number) {
    return this.prisma.productionTask.update({
      where: { id },
      data: { planned }
    });
  }

  async deleteTask(id: number) {
    return this.prisma.productionTask.delete({
      where: { id }
    });
  }

  async addBatch(data: { taskId: number; quantity: number; type: string }) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.productionTask.findUnique({
        where: { id: data.taskId },
        include: { product: true }
      });
      if (!task) throw new Error('Task not found');

      const batchType = data.type === 'Готово' || data.type === 'READY' ? 'READY' : 'DEFECT';
      const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      // 1. Создаем лог
      const log = await tx.batchLog.create({
        data: {
          taskId: data.taskId,
          time,
          productName: task.product.name,
          quantity: data.quantity,
          type: batchType as BatchType
        },
      });

      // 2. Ищем рецепт и списываем сырье
      const recipe = await tx.recipe.findUnique({
        where: { productId: task.productId },
        include: { ingredients: true }
      });

      if (recipe) {
        for (const ingredient of recipe.ingredients) {
          const totalRawMaterialNeeded = Number(ingredient.quantity || 0) * data.quantity;
          
          await tx.rawMaterial.update({
            where: { id: ingredient.rawMaterialId },
            data: { stock: { decrement: totalRawMaterialNeeded } }
          });
        }
      } else {
        console.warn(`No recipe found for product ID ${task.productId}. Raw materials not deducted.`);
      }

      // 3. Обновляем статус задачи и приходуем готовую продукцию (только для READY)
      if (batchType === 'READY') {
        await tx.productionTask.update({
          where: { id: data.taskId },
          data: { completed: task.completed + data.quantity },
        });

        await tx.product.update({
          where: { id: task.productId },
          data: { stock: { increment: data.quantity } }
        });
      }

      return log;
    });
  }

  async autoPlan(targetDate: string) {
    const d = new Date(targetDate);
    const dateStart = new Date(d.setHours(0, 0, 0, 0));
    const dateEnd = new Date(d.setHours(23, 59, 59, 999));

    // 1. Fetch all DeliveryOrders for this date that are not cancelled
    const orders = await this.prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: dateStart, lt: dateEnd },
        status: { in: ['PENDING', 'IN_TRANSIT', 'DELIVERED'] }
      },
      include: { items: true }
    });

    const productCounts: Record<number, number> = {};
    for (const order of orders) {
      for (const item of order.items) {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
      }
    }

    // 2. Predictive Retail Forecast (Прогноз витрины)
    const targetDayOfWeek = dateStart.getDay(); // 0 = Sunday, 1 = Monday ...
    const weeksToLookBack = 4;
    const historyStart = new Date(dateStart);
    historyStart.setDate(historyStart.getDate() - weeksToLookBack * 7);

    const pastSales = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: historyStart, lt: dateStart }
        }
      },
      include: { sale: true }
    });

    const retailSums: Record<number, number> = {};
    let matchedDaysCount = weeksToLookBack; // For averaging, usually 4

    for (const item of pastSales) {
      const saleDate = new Date(item.sale.createdAt);
      if (saleDate.getDay() === targetDayOfWeek) {
        retailSums[item.productId] = (retailSums[item.productId] || 0) + item.quantity;
      }
    }

    // Add forecast to the B2B counts
    for (const [productIdStr, totalSold] of Object.entries(retailSums)) {
      const productId = Number(productIdStr);
      const averageSold = totalSold / matchedDaysCount;
      const forecastWithBuffer = Math.ceil(averageSold * 1.05); // 5% buffer
      
      productCounts[productId] = (productCounts[productId] || 0) + forecastWithBuffer;
    }

    // 3. Create or Update ProductionTasks
    const results = [];
    for (const [productIdStr, qty] of Object.entries(productCounts)) {
      const productId = Number(productIdStr);
      
      const existingTask = await this.prisma.productionTask.findFirst({
        where: {
          productId,
          date: { gte: dateStart, lt: dateEnd }
        }
      });

      if (existingTask) {
        // OVERWRITE the plan exactly with the new calculation, but don't set it lower than what's already completed
        const finalQty = Math.max(qty, existingTask.completed);
        const updated = await this.prisma.productionTask.update({
          where: { id: existingTask.id },
          data: { planned: finalQty }
        });
        results.push(updated);
      } else {
        const newTask = await this.prisma.productionTask.create({
          data: {
            productId,
            planned: qty,
            date: dateStart
          }
        });
        results.push(newTask);
      }
    }
    return { success: true, message: `План успешно рассчитан!` };
  }

  async getStats() {
    const tasks = await this.prisma.productionTask.findMany();
    const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
    const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
    return { totalPlanned, totalCompleted, progressPercent: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0 };
  }
}
