import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private service;
    constructor(service: PurchasesService);
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
    getNeeds(): Promise<{
        id: number;
        name: string;
        currentStock: number;
        minLimit: number;
        recommendedQty: number;
        unit: string;
    }[]>;
    create(dto: any): Promise<{
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
}
