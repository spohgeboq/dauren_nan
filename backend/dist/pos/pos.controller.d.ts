import { PosService } from './pos.service';
export declare class PosController {
    private service;
    constructor(service: PosService);
    openShift(dto: {
        userId: number;
        startCash: number;
    }): Promise<{
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
    closeShift(id: number): Promise<{
        id: number;
        userId: number;
        isOpen: boolean;
        startCash: number;
        endCash: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    getActiveShift(userId: string): Promise<({
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
            total: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            shiftId: number;
            userId: number;
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
    getShiftSummary(id: number): Promise<{
        salesCount: number;
        totalCash: number;
        totalKaspi: number;
        totalRevenue: number;
    }>;
    createSale(dto: {
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
        total: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        shiftId: number;
        userId: number;
    }>;
}
