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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductionService = class ProductionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTasks(date) {
        const where = {};
        if (date) {
            const d = new Date(date);
            where.date = { gte: new Date(d.setHours(0, 0, 0, 0)), lt: new Date(new Date(date).setHours(23, 59, 59, 999)) };
        }
        return this.prisma.productionTask.findMany({ where, include: { product: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } });
    }
    async getLogs(taskId) {
        const where = {};
        if (taskId)
            where.taskId = taskId;
        return this.prisma.batchLog.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async createTask(data) {
        return this.prisma.productionTask.create({ data, include: { product: true } });
    }
    async updateTask(id, planned) {
        return this.prisma.productionTask.update({
            where: { id },
            data: { planned }
        });
    }
    async deleteTask(id) {
        return this.prisma.productionTask.delete({
            where: { id }
        });
    }
    async addBatch(data) {
        return this.prisma.$transaction(async (tx) => {
            const task = await tx.productionTask.findUnique({
                where: { id: data.taskId },
                include: { product: true }
            });
            if (!task)
                throw new Error('Task not found');
            const batchType = data.type === 'Готово' || data.type === 'READY' ? 'READY' : 'DEFECT';
            const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const log = await tx.batchLog.create({
                data: {
                    taskId: data.taskId,
                    time,
                    productName: task.product.name,
                    quantity: data.quantity,
                    type: batchType
                },
            });
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
            }
            else {
                console.warn(`No recipe found for product ID ${task.productId}. Raw materials not deducted.`);
            }
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
    async autoPlan(targetDate) {
        const d = new Date(targetDate);
        const dateStart = new Date(d.setHours(0, 0, 0, 0));
        const dateEnd = new Date(d.setHours(23, 59, 59, 999));
        const orders = await this.prisma.deliveryOrder.findMany({
            where: {
                createdAt: { gte: dateStart, lt: dateEnd },
                status: { in: ['PENDING', 'IN_TRANSIT', 'DELIVERED'] }
            },
            include: { items: true }
        });
        const productCounts = {};
        for (const order of orders) {
            for (const item of order.items) {
                productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
            }
        }
        const targetDayOfWeek = dateStart.getDay();
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
        const retailSums = {};
        let matchedDaysCount = weeksToLookBack;
        for (const item of pastSales) {
            const saleDate = new Date(item.sale.createdAt);
            if (saleDate.getDay() === targetDayOfWeek) {
                retailSums[item.productId] = (retailSums[item.productId] || 0) + item.quantity;
            }
        }
        for (const [productIdStr, totalSold] of Object.entries(retailSums)) {
            const productId = Number(productIdStr);
            const averageSold = totalSold / matchedDaysCount;
            const forecastWithBuffer = Math.ceil(averageSold * 1.05);
            productCounts[productId] = (productCounts[productId] || 0) + forecastWithBuffer;
        }
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
                const finalQty = Math.max(qty, existingTask.completed);
                const updated = await this.prisma.productionTask.update({
                    where: { id: existingTask.id },
                    data: { planned: finalQty }
                });
                results.push(updated);
            }
            else {
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
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map