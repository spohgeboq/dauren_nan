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

  async getStats(period: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (period === 'Сегодня' || period === 'today') {
      startDate = new Date(today);
    } else if (period === 'Эта неделя' || period === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'Этот месяц' || period === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'Этот год' || period === 'year') {
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    // 1. Revenue
    const salesInPeriod = await this.prisma.sale.findMany({
      where: { createdAt: { gte: startDate, lt: endDate } }
    });
    const totalSalesRevenue = salesInPeriod.reduce((sum, s) => sum + s.total, 0);

    const b2bInPeriod = await this.prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
        status: 'DELIVERED'
      }
    });
    const totalB2bRevenue = b2bInPeriod.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = totalSalesRevenue + totalB2bRevenue;

    // 2. Expenses
    const expensesInPeriod = await this.prisma.expense.findMany({
      where: { date: { gte: startDate, lt: endDate } }
    });
    const totalDirectExpenses = expensesInPeriod.reduce((sum, e) => sum + e.amount, 0);

    const completedBatches = await this.prisma.productionBatch.findMany({
      where: {
        status: 'COMPLETED',
        endTime: { gte: startDate, lt: endDate }
      },
      include: {
        product: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: {
                    rawMaterial: true
                  }
                }
              }
            }
          }
        }
      }
    });

    let rawMaterialsCost = 0;
    for (const batch of completedBatches) {
      if (batch.product.recipe) {
        for (const ing of batch.product.recipe.ingredients) {
          const qtyUsed = (ing.quantity || ing.amount || 0) * batch.quantity;
          rawMaterialsCost += qtyUsed * (ing.rawMaterial.costPerUnit || 0);
        }
      }
    }

    const totalExpenses = totalDirectExpenses + rawMaterialsCost;
    const netProfit = totalRevenue - totalExpenses;

    // 3. Debtors
    const debtorsList = await this.prisma.client.findMany({
      where: { balance: { lt: 0 } },
      orderBy: { balance: 'asc' },
      take: 5
    });

    const debtors = debtorsList.map(d => ({
      id: d.id,
      name: d.name,
      amount: Math.abs(d.balance),
      daysOverdue: 7
    }));

    const totalDebt = debtors.reduce((sum, d) => sum + d.amount, 0);

    // 4. Bar chart daily last 7 days
    const barData = [];
    const daysName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = await this.prisma.sale.findMany({
        where: { createdAt: { gte: dayStart, lt: dayEnd } }
      });
      const daySalesSum = daySales.reduce((sum, s) => sum + s.total, 0);

      const dayB2b = await this.prisma.deliveryOrder.findMany({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          status: 'DELIVERED'
        }
      });
      const dayB2bSum = dayB2b.reduce((sum, o) => sum + o.totalAmount, 0);
      const dayRevenue = daySalesSum + dayB2bSum;

      const dayDirectExpenses = await this.prisma.expense.findMany({
        where: { date: { gte: dayStart, lt: dayEnd } }
      });
      const dayDirectExpensesSum = dayDirectExpenses.reduce((sum, e) => sum + e.amount, 0);

      const dayBatches = await this.prisma.productionBatch.findMany({
        where: {
          status: 'COMPLETED',
          endTime: { gte: dayStart, lt: dayEnd }
        },
        include: {
          product: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      rawMaterial: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      let dayRawMaterialsCost = 0;
      for (const batch of dayBatches) {
        if (batch.product.recipe) {
          for (const ing of batch.product.recipe.ingredients) {
            const qtyUsed = (ing.quantity || ing.amount || 0) * batch.quantity;
            dayRawMaterialsCost += qtyUsed * (ing.rawMaterial.costPerUnit || 0);
          }
        }
      }

      const dayExpenses = dayDirectExpensesSum + dayRawMaterialsCost;

      barData.push({
        day: daysName[dayStart.getDay()],
        revenue: dayRevenue,
        expenses: dayExpenses
      });
    }

    // 5. Pie chart
    const productSalesMap: Record<string, number> = {};

    const retailSalesInPeriod = await this.prisma.saleItem.findMany({
      where: { sale: { createdAt: { gte: startDate, lt: endDate } } },
      include: { product: true }
    });

    const b2bSalesInPeriod = await this.prisma.deliveryOrderItem.findMany({
      where: { order: { createdAt: { gte: startDate, lt: endDate }, status: 'DELIVERED' } },
      include: { product: true }
    });

    for (const item of retailSalesInPeriod) {
      const pName = item.product.name;
      productSalesMap[pName] = (productSalesMap[pName] || 0) + item.quantity * item.price;
    }

    for (const item of b2bSalesInPeriod) {
      const pName = item.product.name;
      productSalesMap[pName] = (productSalesMap[pName] || 0) + item.quantity * item.price;
    }

    const sortedProducts = Object.entries(productSalesMap)
      .map(([name, sum]) => ({ name, sum }))
      .sort((a, b) => b.sum - a.sum);

    const totalProductSalesSum = sortedProducts.reduce((acc, p) => acc + p.sum, 0);

    const colors = ['#0f172a', '#3b82f6', '#f59e0b', '#10b981', '#6366f1'];
    let pieData = [];
    if (totalProductSalesSum > 0) {
      let percentSum = 0;
      pieData = sortedProducts.slice(0, 4).map((p, idx) => {
        const pct = Math.round((p.sum / totalProductSalesSum) * 100);
        percentSum += pct;
        return {
          name: p.name,
          percent: pct,
          color: colors[idx % colors.length]
        };
      });

      if (sortedProducts.length > 4) {
        pieData.push({
          name: 'Другие',
          percent: Math.max(0, 100 - percentSum),
          color: '#64748b'
        });
      }
    } else {
      pieData = [
        { name: 'Таба нан', percent: 45, color: '#0f172a' },
        { name: 'Тандырная лепешка', percent: 30, color: '#3b82f6' },
        { name: 'Батон нарезной', percent: 15, color: '#f59e0b' },
        { name: 'Круассаны', percent: 10, color: '#10b981' }
      ];
    }

    // 6. Drivers
    const driversList = await this.prisma.user.findMany({
      where: { role: 'DRIVER', status: 'ACTIVE' },
      include: {
        routes: {
          where: { date: { gte: startDate, lt: endDate } },
          include: { points: true }
        }
      }
    });

    const drivers = driversList.map(d => {
      let pointsCount = 0;
      d.routes.forEach(r => {
        pointsCount += r.points.length;
      });

      return {
        id: d.id,
        name: d.name || d.email,
        points: pointsCount,
        returns: 0,
        status: d.isOnShift ? 'На линии' : 'Завершил'
      };
    });

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: netProfit,
      debt: totalDebt,
      debtors,
      barData,
      pieData,
      drivers
    };
  }
}
