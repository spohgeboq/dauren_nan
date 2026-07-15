import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // Trigger IDE cache reset
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class BakerService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

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
    
    // Получаем B2B заказы для сборки
    const b2bOrders = await this.prisma.deliveryOrder.findMany({
      // @ts-ignore - type cache issue
      where: { status: 'PENDING', isBaked: false },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return { products, rawMaterials, activeBatches, b2bOrders };
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
          const material = await tx.rawMaterial.findUnique({ where: { id: ing.rawMaterialId } });
          const matUnit = (material?.unit || '').toLowerCase();
          const ingUnit = ((ing as any).unit || matUnit).toLowerCase();
          
          let amount = Number(ing.quantity || ing.amount || 0);

          if (matUnit === 'кг' && ingUnit === 'г') amount /= 1000;
          if (matUnit === 'л' && ingUnit === 'мл') amount /= 1000;
          if (matUnit === 'г' && ingUnit === 'кг') amount *= 1000;
          if (matUnit === 'мл' && ingUnit === 'л') amount *= 1000;

          const totalNeeded = amount * quantity;
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
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { recipe: { include: { ingredients: true } } },
    });

    if (!product) throw new NotFoundException('Продукт не найден');

    return this.prisma.$transaction(async (tx) => {
      // 1. Списываем сырье
      if (product.recipe) {
        for (const ing of product.recipe.ingredients) {
          const material = await tx.rawMaterial.findUnique({ where: { id: ing.rawMaterialId } });
          const matUnit = (material?.unit || '').toLowerCase();
          const ingUnit = ((ing as any).unit || matUnit).toLowerCase();
          
          let amount = Number(ing.quantity || ing.amount || 0);

          if (matUnit === 'кг' && ingUnit === 'г') amount /= 1000;
          if (matUnit === 'л' && ingUnit === 'мл') amount /= 1000;
          if (matUnit === 'г' && ingUnit === 'кг') amount *= 1000;
          if (matUnit === 'мл' && ingUnit === 'л') amount *= 1000;

          const totalNeeded = amount * quantity;
          await tx.rawMaterial.update({
            where: { id: ing.rawMaterialId },
            data: { stock: { decrement: totalNeeded } },
          });
        }
      }

      // 2. Логируем в DefectLog
      const defect = await tx.defectLog.create({
        data: { productId, quantity, reason, bakerId },
      });

      // 3. Обновляем задачу и BatchLog (если задача есть, иначе создаем)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let task = await tx.productionTask.findFirst({
        where: { productId, date: { gte: todayStart, lte: todayEnd } }
      });

      if (!task) {
        task = await tx.productionTask.create({
          data: { productId, planned: 0, completed: 0, date: todayStart }
        });
      }

      const timeStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      await tx.batchLog.create({
        data: {
          taskId: task.id,
          time: timeStr,
          productName: product.name,
          quantity,
          type: 'DEFECT'
        }
      });

      return { success: true, defect };
    });
  }

  // Завершение B2B заказа
  async markB2bOrderReady(orderId: number) {
    const order = await this.prisma.deliveryOrder.findUnique({ 
      where: { id: orderId },
      include: { items: { include: { product: { include: { recipe: { include: { ingredients: true } } } } } } }
    });
    if (!order) throw new NotFoundException('Заказ не найден');

    await this.prisma.$transaction(async (tx) => {
      // Списываем сырье
      for (const item of order.items) {
        if (item.product.recipe) {
          for (const ing of item.product.recipe.ingredients) {
            const totalNeeded = Number(ing.quantity || ing.amount || 0) * item.quantity;
            await tx.rawMaterial.update({
              where: { id: ing.rawMaterialId },
              data: { stock: { decrement: totalNeeded } },
            });
          }
        }
      }

      // Обновляем статус заказа
      await tx.deliveryOrder.update({
        where: { id: orderId },
        data: { isBaked: true }
      });
    });

    // Отправляем сокет-событие клиенту
    this.eventsGateway.server.emit('orderStatusUpdated', {
      orderId: order.id,
      status: 'BAKED',
      message: 'Ваш заказ испечен и ожидает отгрузки курьеру!'
    });

    return { success: true, message: 'Заказ отмечен как готовый и сырье списано' };
  }

  // Фиксация выпечки для витрины (Единая транзакция)
  async logShowcaseBatch(productId: number, quantity: number, bakerId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { recipe: { include: { ingredients: true } } },
    });

    if (!product) throw new NotFoundException('Продукт не найден');

    return this.prisma.$transaction(async (tx) => {
      // 1. Пополнение витрины
      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      });

      // 2. Списываем сырье по техкарте
      if (product.recipe) {
        for (const ing of product.recipe.ingredients) {
          const totalNeeded = Number(ing.quantity || ing.amount || 0) * quantity;
          await tx.rawMaterial.update({
            where: { id: ing.rawMaterialId },
            data: { stock: { decrement: totalNeeded } },
          });
        }
      }

      // 3. Обновляем задачу на производство (ProductionTask), если она есть на сегодня
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let task = await tx.productionTask.findFirst({
        where: { productId, date: { gte: todayStart, lte: todayEnd } }
      });

      // Если задачи нет, создадим её "по факту"
      if (!task) {
        task = await tx.productionTask.create({
          data: { productId, planned: 0, completed: 0, date: todayStart }
        });
      }

      await tx.productionTask.update({
        where: { id: task.id },
        data: { completed: { increment: quantity } }
      });

      // 4. Логируем в BatchLog
      const timeStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      await tx.batchLog.create({
        data: {
          taskId: task.id,
          time: timeStr,
          productName: product.name,
          quantity,
          type: 'READY'
        }
      });

      return { success: true };
    });
  }
}
