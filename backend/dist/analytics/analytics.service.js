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
        const todayIncomes = await this.prisma.income.findMany({
            where: { date: { gte: today, lt: tomorrow } },
        });
        const totalSalesToday = todayIncomes.reduce((sum, s) => sum + Number(s.amount), 0);
        const salesCount = todayIncomes.filter(i => i.source === 'POS').length;
        const todayExpenses = await this.prisma.expense.findMany({
            where: { date: { gte: today, lt: tomorrow } },
        });
        const totalExpensesToday = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const clientsCount = await this.prisma.client.count();
        const debtors = await this.prisma.client.findMany({ where: { balance: { lt: 0 } } });
        const totalDebt = debtors.reduce((acc, c) => acc + Math.abs(c.balance), 0);
        const pendingOrders = await this.prisma.order.count({ where: { status: 'NEW' } });
        const tasks = await this.prisma.productionTask.findMany({
            where: { date: { gte: today, lt: tomorrow } },
        });
        const totalPlanned = tasks.reduce((sum, t) => sum + t.planned, 0);
        const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
        const allInventory = await this.prisma.rawMaterial.findMany();
        const criticalItems = allInventory.filter(i => Number(i.stock) < Number(i.minLimit)).length;
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
    async getStats(period) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        if (period === 'Сегодня' || period === 'today') {
            startDate = new Date(today);
        }
        else if (period === 'Эта неделя' || period === 'week') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
        }
        else if (period === 'Этот месяц' || period === 'month') {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }
        else if (period === 'Этот год' || period === 'year') {
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
        }
        else {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }
        const incomesInPeriod = await this.prisma.income.findMany({
            where: { date: { gte: startDate, lt: endDate } }
        });
        const totalRevenue = incomesInPeriod.reduce((sum, i) => sum + Number(i.amount), 0);
        const expensesInPeriod = await this.prisma.expense.findMany({
            where: { date: { gte: startDate, lt: endDate } }
        });
        const totalDirectExpenses = expensesInPeriod.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalExpenses = totalDirectExpenses;
        const netProfit = totalRevenue - totalExpenses;
        const allIncomes = await this.prisma.income.findMany();
        const allExpenses = await this.prisma.expense.findMany();
        let cashIncome = 0;
        let kaspiIncome = 0;
        allIncomes.forEach(i => {
            if (i.paymentMethod === 'CASH')
                cashIncome += Number(i.amount);
            if (i.paymentMethod === 'KASPI')
                kaspiIncome += Number(i.amount);
        });
        let cashExpense = 0;
        let kaspiExpense = 0;
        allExpenses.forEach(e => {
            if (e.paymentMethod === 'CASH')
                cashExpense += Number(e.amount);
            if (e.paymentMethod === 'KASPI')
                kaspiExpense += Number(e.amount);
        });
        const cashbox = {
            cash: cashIncome - cashExpense,
            kaspi: kaspiIncome - kaspiExpense,
        };
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
        const barData = [];
        const daysName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const dayIncomes = await this.prisma.income.findMany({
                where: { date: { gte: dayStart, lt: dayEnd } }
            });
            const dayRevenue = dayIncomes.reduce((sum, s) => sum + Number(s.amount), 0);
            const dayDirectExpenses = await this.prisma.expense.findMany({
                where: { date: { gte: dayStart, lt: dayEnd } }
            });
            const dayDirectExpensesSum = dayDirectExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            const dayExpenses = dayDirectExpensesSum;
            barData.push({
                day: daysName[dayStart.getDay()],
                revenue: dayRevenue,
                expenses: dayExpenses
            });
        }
        const productSalesMap = {};
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
        }
        else {
            pieData = [];
        }
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
            cashbox,
            barData,
            pieData,
            drivers
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map