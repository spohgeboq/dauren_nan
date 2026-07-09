import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sales today
    const todaySales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });
    const totalSalesToday = todaySales.reduce((sum, s) => sum + s.total, 0);
    const salesCount = todaySales.length;

    // Expenses today
    const todayExpenses = await this.prisma.expense.findMany({
      where: { date: { gte: today, lt: tomorrow } },
    });
    const totalExpensesToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Active clients
    const clientsCount = await this.prisma.client.count();

    // Client debts
    const debtors = await this.prisma.client.findMany({ where: { balance: { lt: 0 } } });
    const totalDebt = debtors.reduce((acc, c) => acc + Math.abs(c.balance), 0);

    // Active orders
    const pendingOrders = await this.prisma.order.count({ where: { status: 'NEW' } });

    // Production progress
    const tasks = await this.prisma.productionTask.findMany({
      where: { date: { gte: today, lt: tomorrow } },
    });
    const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
    const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);

    // Inventory critical
    const allInventory = await this.prisma.inventoryItem.findMany();
    const criticalItems = allInventory.filter(i => i.currentStock < i.minLimit).length;

    return {
      sales: { total: totalSalesToday, count: salesCount },
      expenses: { total: totalExpensesToday },
      clients: { count: clientsCount, totalDebt },
      orders: { pending: pendingOrders },
      production: { planned: totalPlanned, completed: totalCompleted, progressPercent: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0 },
      inventory: { criticalItems },
      profit: totalSalesToday - totalExpensesToday,
    };
  }
}
