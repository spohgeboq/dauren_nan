"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(category, month) {
        const where = {};
        if (category && category !== 'Все')
            where.category = category;
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
    async create(data) {
        return this.prisma.expense.create({
            data: {
                date: data.date ? new Date(data.date) : new Date(),
                category: data.category,
                description: data.description,
                paymentMethod: data.paymentMethod,
                amount: data.amount,
                isAuto: data.isAuto || false,
                vehicleId: data.vehicleId || null,
                userId: data.userId || null,
            },
        });
    }
    async getStats(month) {
        const expenses = await this.findAll(undefined, month);
        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const byCategory = {};
        expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount); });
        const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
        return { total, byCategory: sorted.map(([name, amount]) => ({ name, amount })), topCategory: sorted[0] ? { name: sorted[0][0], amount: sorted[0][1] } : null };
    }
    async delete(id) {
        return this.prisma.expense.delete({ where: { id } });
    }
    async paySalaries() {
        const users = await this.prisma.user.findMany({ where: { fixedSalary: { gt: 0 }, status: 'ACTIVE' } });
        const expenses = [];
        for (const user of users) {
            const expense = await this.prisma.expense.create({
                data: {
                    category: 'SALARY',
                    description: `Зарплата сотруднику: ${user.name || user.login}`,
                    amount: user.fixedSalary,
                    paymentMethod: 'CASH',
                    isAuto: true,
                    userId: user.id
                }
            });
            expenses.push(expense);
        }
        return { success: true, paidCount: expenses.length, expenses };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map