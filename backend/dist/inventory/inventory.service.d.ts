import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        currentStock: number;
        minLimit: number;
        costPerUnit: number;
        baseUnit: string;
        purchaseUnit: string;
        conversionRatio: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        currentStock: number;
        minLimit: number;
        costPerUnit: number;
        baseUnit: string;
        purchaseUnit: string;
        conversionRatio: number;
    } | null>;
    create(data: {
        name: string;
        currentStock?: number;
        minLimit?: number;
        costPerUnit?: number;
        baseUnit?: string;
        purchaseUnit?: string;
        conversionRatio?: number;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        currentStock: number;
        minLimit: number;
        costPerUnit: number;
        baseUnit: string;
        purchaseUnit: string;
        conversionRatio: number;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        currentStock: number;
        minLimit: number;
        costPerUnit: number;
        baseUnit: string;
        purchaseUnit: string;
        conversionRatio: number;
    }>;
    getStats(): Promise<{
        totalItems: number;
        criticalItems: number;
        totalValue: number;
    }>;
}
