import { PrismaService } from '../prisma/prisma.service';
export declare class PosService {
    private prisma;
    constructor(prisma: PrismaService);
    openShift(userId: number, startCash: number): Promise<{
        user: {
            id: number;
            name: string | null;
        };
    } & {
        id: number;
        userId: number;
        isOpen: boolean;
        startCash: number;
        endCash: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    closeShift(shiftId: number): Promise<{
        id: number;
        userId: number;
        isOpen: boolean;
        startCash: number;
        endCash: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    createSale(data: {
        shiftId: number;
        userId: number;
        paymentMethod: string;
        items: {
            productId: number;
            quantity: number;
            price: number;
        }[];
    }): Promise<{
        items: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            productId: number;
            saleId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        userId: number;
        total: number;
        shiftId: number;
    }>;
    getActiveShift(userId: number): Promise<({
        sales: ({
            items: {
                id: number;
                price: number;
                quantity: number;
                productId: number;
                saleId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            userId: number;
            total: number;
            shiftId: number;
        })[];
    } & {
        id: number;
        userId: number;
        isOpen: boolean;
        startCash: number;
        endCash: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }) | null>;
    getShiftSummary(shiftId: number): Promise<{
        salesCount: number;
        totalCash: number;
        totalKaspi: number;
        totalRevenue: number;
    }>;
}
