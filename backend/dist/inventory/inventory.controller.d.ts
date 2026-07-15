import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private service;
    constructor(service: InventoryService);
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getStats(): Promise<{
        totalItems: number;
        criticalItems: number;
        totalValue: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    } | null>;
    create(dto: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }>;
    adjust(dto: {
        rawMaterialId: number;
        type: 'AUDIT' | 'WRITE_OFF';
        amount: number;
        reason?: string;
    }): Promise<{
        adjustment: {
            id: number;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AdjustmentType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            rawMaterialId: number;
            expenseId: number | null;
        };
        newStock: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: number, dto: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }>;
}
