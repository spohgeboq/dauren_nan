import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        sales: {
            total: number;
            count: number;
        };
        expenses: {
            total: number;
        };
        clients: {
            count: number;
            totalDebt: number;
        };
        orders: {
            pending: number;
        };
        production: {
            planned: number;
            completed: number;
            progressPercent: number;
        };
        inventory: {
            criticalItems: number;
        };
        profit: number;
    }>;
}
