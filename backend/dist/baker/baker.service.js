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
exports.BakerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let BakerService = class BakerService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
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
        const b2bOrders = await this.prisma.deliveryOrder.findMany({
            where: { status: 'PENDING', isBaked: false },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'asc' },
        });
        return { products, rawMaterials, activeBatches, b2bOrders };
    }
    async startBatch(productId, quantity, bakerId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { recipe: { include: { ingredients: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Продукт не найден');
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
            const batch = await tx.productionBatch.create({
                data: {
                    productId,
                    quantity,
                    bakerId,
                    status: 'IN_PROGRESS',
                },
            });
            if (product.recipe) {
                for (const ing of product.recipe.ingredients) {
                    const totalNeeded = Number(ing.quantity || ing.amount || 0) * quantity;
                    await tx.rawMaterial.update({
                        where: { id: ing.rawMaterialId },
                        data: { stock: { decrement: totalNeeded } },
                    });
                }
            }
            return { success: true, batch, hasPlannedTask: !!taskExists };
        });
    }
    async finishBatch(batchId) {
        const batch = await this.prisma.productionBatch.findUnique({ where: { id: batchId } });
        if (!batch || batch.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Партия не найдена или уже завершена');
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
    async recordDefect(productId, quantity, reason, bakerId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { recipe: { include: { ingredients: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Продукт не найден');
        return this.prisma.$transaction(async (tx) => {
            if (product.recipe) {
                for (const ing of product.recipe.ingredients) {
                    const totalNeeded = Number(ing.quantity || ing.amount || 0) * quantity;
                    await tx.rawMaterial.update({
                        where: { id: ing.rawMaterialId },
                        data: { stock: { decrement: totalNeeded } },
                    });
                }
            }
            const defect = await tx.defectLog.create({
                data: { productId, quantity, reason, bakerId },
            });
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
    async markB2bOrderReady(orderId) {
        const order = await this.prisma.deliveryOrder.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: { include: { recipe: { include: { ingredients: true } } } } } } }
        });
        if (!order)
            throw new common_1.NotFoundException('Заказ не найден');
        await this.prisma.$transaction(async (tx) => {
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
            await tx.deliveryOrder.update({
                where: { id: orderId },
                data: { isBaked: true }
            });
        });
        this.eventsGateway.server.emit('orderStatusUpdated', {
            orderId: order.id,
            status: 'BAKED',
            message: 'Ваш заказ испечен и ожидает отгрузки курьеру!'
        });
        return { success: true, message: 'Заказ отмечен как готовый и сырье списано' };
    }
    async logShowcaseBatch(productId, quantity, bakerId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { recipe: { include: { ingredients: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Продукт не найден');
        return this.prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id: productId },
                data: { stock: { increment: quantity } },
            });
            if (product.recipe) {
                for (const ing of product.recipe.ingredients) {
                    const totalNeeded = Number(ing.quantity || ing.amount || 0) * quantity;
                    await tx.rawMaterial.update({
                        where: { id: ing.rawMaterialId },
                        data: { stock: { decrement: totalNeeded } },
                    });
                }
            }
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
            await tx.productionTask.update({
                where: { id: task.id },
                data: { completed: { increment: quantity } }
            });
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
};
exports.BakerService = BakerService;
exports.BakerService = BakerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], BakerService);
//# sourceMappingURL=baker.service.js.map