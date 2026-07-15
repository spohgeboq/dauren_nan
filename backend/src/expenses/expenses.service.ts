import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseCategory, PaymentMethod } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, month?: string) {
    const where: any = {};
    if (category && category !== 'Все') where.category = category as ExpenseCategory;
    if (month && month !== 'Все') {
      const [m, y] = month.split('-');
      const start = new Date(parseInt(y), parseInt(m) - 1, 1);
      const end = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }
    return this.prisma.expense.findMany({ 
      where, 
      orderBy: { date: 'desc' },
      include: {
        vehicle: true,
        user: true,
        supplierPayments: { include: { supplier: true } },
      }
    });
  }

  async create(data: { date?: string; category: string; description?: string; paymentMethod: string; amount: number; isAuto?: boolean; vehicleId?: number; userId?: number }) {
    return this.prisma.expense.create({
      data: {
        date: data.date ? new Date(data.date) : new Date(),
        category: data.category as ExpenseCategory,
        description: data.description,
        paymentMethod: data.paymentMethod as PaymentMethod,
        amount: data.amount,
        // @ts-ignore
        isAuto: data.isAuto || false,
        // @ts-ignore
        vehicleId: data.vehicleId || null,
        // @ts-ignore
        userId: data.userId || null,
      },
    });
  }

  async getStats(month?: string) {
    const expenses = await this.findAll(undefined, month);
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount); });
    const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
    return { total, byCategory: sorted.map(([name, amount]) => ({ name, amount })), topCategory: sorted[0] ? { name: sorted[0][0], amount: sorted[0][1] } : null };
  }

  async delete(id: number) {
    return this.prisma.expense.delete({ where: { id } });
  }

  async paySalaries() {
    // Find all users with fixed salary > 0
    // @ts-ignore
    const users = await this.prisma.user.findMany({ where: { fixedSalary: { gt: 0 }, status: 'ACTIVE' } });
    const expenses = [];
    
    for (const user of users) {
      const expense = await this.prisma.expense.create({
        data: {
          category: 'SALARY' as ExpenseCategory,
          description: `Зарплата сотруднику: ${user.name || user.login}`,
          amount: user.fixedSalary as any,
          paymentMethod: 'CASH' as PaymentMethod,
          // @ts-ignore
          isAuto: true,
          // @ts-ignore
          userId: user.id
        }
      });
      expenses.push(expense);
    }
    return { success: true, paidCount: expenses.length, expenses };
  }
}
