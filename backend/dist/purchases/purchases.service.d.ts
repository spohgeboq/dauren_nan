import { PrismaService } from '../prisma/prisma.service';
export declare class PurchasesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        items: {
            id: number;
            name: string;
            orderedQty: number;
            unit: string;
            inventoryItemId: number | null;
            purchaseId: number;
        }[];
    } & {
        id: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        totalSum: number;
        supplier: string | null;
    })[]>;
    create(data: {
        supplier?: string;
        totalSum?: number;
        items: {
            name: string;
            orderedQty: number;
            unit: string;
            inventoryItemId?: number;
        }[];
    }): Promise<{
        items: {
            id: number;
            name: string;
            orderedQty: number;
            unit: string;
            inventoryItemId: number | null;
            purchaseId: number;
        }[];
    } & {
        id: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        totalSum: number;
        supplier: string | null;
    }>;
    receive(id: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        totalSum: number;
        supplier: string | null;
    } | null>;
    getNeeds(): Promise<{
        id: number;
        name: string;
        currentStock: number;
        minLimit: number;
        recommendedQty: number;
        unit: string;
    }[]>;
}
