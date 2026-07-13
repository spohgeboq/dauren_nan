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
exports.CourierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const events_gateway_1 = require("../events/events.gateway");
let CourierService = class CourierService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async getOrders(driverId) {
        const orders = await this.prisma.deliveryOrder.findMany({
            where: {
                driverId,
                status: { in: [client_1.DeliveryOrderStatus.PENDING, client_1.DeliveryOrderStatus.IN_TRANSIT] },
            },
            include: {
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { orders };
    }
    async updateOrderStatus(orderId, status, paymentMethod) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.deliveryOrder.findUnique({ where: { id: orderId } });
            if (!order)
                throw new common_1.NotFoundException('Заказ не найден');
            let mappedStatus = client_1.DeliveryOrderStatus.PENDING;
            if (status === 'IN_TRANSIT')
                mappedStatus = client_1.DeliveryOrderStatus.IN_TRANSIT;
            if (status === 'DELIVERED')
                mappedStatus = client_1.DeliveryOrderStatus.DELIVERED;
            if (status === 'CANCELLED')
                mappedStatus = client_1.DeliveryOrderStatus.CANCELLED;
            const newPaymentMethod = paymentMethod || order.paymentMethod;
            const wasDebtDelivered = order.status === client_1.DeliveryOrderStatus.DELIVERED && order.paymentMethod === 'DEBT';
            const isDebtDelivered = mappedStatus === client_1.DeliveryOrderStatus.DELIVERED && newPaymentMethod === 'DEBT';
            await tx.deliveryOrder.update({
                where: { id: orderId },
                data: {
                    status: mappedStatus,
                    paymentMethod: newPaymentMethod,
                    isPaid: mappedStatus === client_1.DeliveryOrderStatus.DELIVERED ? true : order.isPaid,
                },
            });
            if (order.clientId) {
                if (!wasDebtDelivered && isDebtDelivered) {
                    await tx.client.update({
                        where: { id: order.clientId },
                        data: { balance: { decrement: order.totalAmount } },
                    });
                }
                else if (wasDebtDelivered && !isDebtDelivered) {
                    await tx.client.update({
                        where: { id: order.clientId },
                        data: { balance: { increment: order.totalAmount } },
                    });
                }
            }
            this.eventsGateway.broadcastOrderStatusUpdate(orderId, mappedStatus);
            return { success: true };
        });
    }
};
exports.CourierService = CourierService;
exports.CourierService = CourierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], CourierService);
//# sourceMappingURL=courier.service.js.map