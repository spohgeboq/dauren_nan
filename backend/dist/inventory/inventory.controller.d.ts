import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private service;
    constructor(service: InventoryService);
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
        currentStock: number;
        minLimit: number;
        costPerUnit: number;
        baseUnit: string;
        purchaseUnit: string;
        conversionRatio: number;
    } | null>;
    create(dto: any): Promise<{
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
    update(id: number, dto: any): Promise<{
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
}
