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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todaySales = await this.prisma.sale.findMany({
            where: { createdAt: { gte: today, lt: tomorrow } },
        });
        const totalSalesToday = todaySales.reduce((sum, s) => sum + s.total, 0);
        const salesCount = todaySales.length;
        const todayExpenses = await this.prisma.expense.findMany({
            where: { date: { gte: today, lt: tomorrow } },
        });
        const totalExpensesToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        const clientsCount = await this.prisma.client.count();
        const debtors = await this.prisma.client.findMany({ where: { balance: { lt: 0 } } });
        const totalDebt = debtors.reduce((acc, c) => acc + Math.abs(c.balance), 0);
        const pendingOrders = await this.prisma.order.count({ where: { status: 'NEW' } });
        const tasks = await this.prisma.productionTask.findMany({
            where: { date: { gte: today, lt: tomorrow } },
        });
        const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
        const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map