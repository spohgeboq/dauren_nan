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

  async addBatch(data: { taskId: number; quantity: number; type: string }) {
    const task = await this.prisma.productionTask.findUnique({ where: { id: data.taskId }, include: { product: true } });
    if (!task) return null;

    const batchType = data.type === 'Готово' || data.type === 'READY' ? 'READY' : 'DEFECT';
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const log = await this.prisma.batchLog.create({
      data: { taskId: data.taskId, time, productName: task.product.name, quantity: data.quantity, type: batchType as BatchType },
    });

    if (batchType === 'READY') {
      await this.prisma.productionTask.update({
        where: { id: data.taskId },
        data: { completed: task.completed + data.quantity },
      });
    }

    return log;
  }

  async getStats() {
    const tasks = await this.prisma.productionTask.findMany();
    const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
    const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
    return { totalPlanned, totalCompleted, progressPercent: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0 };
  }
}
