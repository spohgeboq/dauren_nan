import { ProductionService } from './production.service';
export declare class ProductionController {
    private service;
    constructor(service: ProductionService);
    getTasks(date?: string): Promise<({
        product: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        planned: number;
        completed: number;
        date: Date;
    })[]>;
    getLogs(taskId?: string): Promise<{
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.BatchType;
        quantity: number;
        time: string;
        taskId: number;
        productName: string;
    }[]>;
    getStats(): Promise<{
        totalPlanned: number;
        totalCompleted: number;
        progressPercent: number;
    }>;
    createTask(dto: {
        productId: number;
        planned: number;
    }): Promise<{
        product: {
            description: string | null;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            categoryId: number;
            sku: string;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            isHit: boolean;
            stock: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        planned: number;
        completed: number;
        date: Date;
    }>;
    updateTask(id: string, planned: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        planned: number;
        completed: number;
        date: Date;
    }>;
    deleteTask(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        planned: number;
        completed: number;
        date: Date;
    }>;
    addBatch(dto: {
        taskId: number;
        quantity: number;
        type: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.BatchType;
        quantity: number;
        time: string;
        taskId: number;
        productName: string;
    }>;
    autoPlan(date: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
