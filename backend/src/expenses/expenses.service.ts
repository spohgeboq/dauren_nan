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
    return this.prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
  }

  async create(data: { date?: string; category: string; description?: string; paymentMethod: string; amount: number }) {
    return this.prisma.expense.create({
      data: {
        date: data.date ? new Date(data.date) : new Date(),
        category: data.category as ExpenseCategory,
        description: data.description,
        paymentMethod: data.paymentMethod as PaymentMethod,
        amount: data.amount,
      },
    });
  }

  async getStats(month?: string) {
    const expenses = await this.findAll(undefined, month);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
    return { total, byCategory: sorted.map(([name, amount]) => ({ name, amount })), topCategory: sorted[0] ? { name: sorted[0][0], amount: sorted[0][1] } : null };
  }
}
