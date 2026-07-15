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
exports.IncomesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IncomesService = class IncomesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.income.create({
            data: {
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                source: data.source,
                description: data.description,
                isAuto: data.isAuto || false,
                userId: data.userId,
            },
        });
    }
    async findAll(params) {
        const where = {};
        if (params?.month && params.month !== 'Все') {
            const [m, y] = params.month.split('-');
            const start = new Date(parseInt(y), parseInt(m) - 1, 1);
            const end = new Date(parseInt(y), parseInt(m), 1);
            where.date = { gte: start, lt: end };
        }
        if (params?.source && params.source !== 'Все') {
            where.source = params.source;
        }
        return this.prisma.income.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
    }
    async remove(id) {
        const income = await this.prisma.income.findUnique({ where: { id } });
        if (!income)
            throw new Error('Income not found');
        if (income.source === 'DEBT_PAYMENT') {
            await this.prisma.clientPayment.deleteMany({
                where: { incomeId: id },
            });
        }
        return this.prisma.income.delete({ where: { id } });
    }
};
exports.IncomesService = IncomesService;
exports.IncomesService = IncomesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncomesService);
//# sourceMappingURL=incomes.service.js.map