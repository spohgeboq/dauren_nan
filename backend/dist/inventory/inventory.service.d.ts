import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: Decimal;
        unit: string;
        costPerUnit: Decimal;
        minLimit: Decimal;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: Decimal;
        unit: string;
        costPerUnit: Decimal;
        minLimit: Decimal;
    } | null>;
    create(data: {
        name: string;
        unit?: string;
        costPerUnit?: number;
        minLimit?: number;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: Decimal;
        unit: string;
        costPerUnit: Decimal;
        minLimit: Decimal;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: Decimal;
        unit: string;
        costPerUnit: Decimal;
        minLimit: Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: Decimal;
        unit: string;
        costPerUnit: Decimal;
        minLimit: Decimal;
    }>;
    adjust(data: {
        rawMaterialId: number;
        type: 'AUDIT' | 'WRITE_OFF';
        amount: number;
        reason?: string;
    }): Promise<{
        adjustment: {
            id: number;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AdjustmentType;
            amount: Decimal;
            reason: string | null;
            rawMaterialId: number;
            expenseId: number | null;
        };
        newStock: Decimal;
    }>;
    getStats(): Promise<{
        totalItems: number;
        criticalItems: number;
        totalValue: number;
    }>;
}
