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
    async addBatch(data) {
        const task = await this.prisma.productionTask.findUnique({ where: { id: data.taskId }, include: { product: true } });
        if (!task)
            return null;
        const batchType = data.type === 'Готово' || data.type === 'READY' ? 'READY' : 'DEFECT';
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const log = await this.prisma.batchLog.create({
            data: { taskId: data.taskId, time, productName: task.product.name, quantity: data.quantity, type: batchType },
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
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map