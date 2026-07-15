import { PrismaService } from '../prisma/prisma.service';
export declare class ProductionService {
    private prisma;
    constructor(prisma: PrismaService);
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
        date: Date;
        planned: number;
        completed: number;
    })[]>;
    getLogs(taskId?: number): Promise<{
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.BatchType;
        quantity: number;
        time: string;
        taskId: number;
        productName: string;
    }[]>;
    createTask(data: {
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
        date: Date;
        planned: number;
        completed: number;
    }>;
    updateTask(id: number, planned: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        date: Date;
        planned: number;
        completed: number;
    }>;
    deleteTask(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        date: Date;
        planned: number;
        completed: number;
    }>;
    addBatch(data: {
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
    autoPlan(targetDate: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getStats(): Promise<{
        totalPlanned: number;
        totalCompleted: number;
        progressPercent: number;
    }>;
}
