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
    getStats(period: string): Promise<{
        revenue: number;
        expenses: number;
        profit: number;
        debt: number;
        debtors: {
            id: number;
            name: string;
            amount: number;
            daysOverdue: number;
        }[];
        cashbox: {
            cash: number;
            kaspi: number;
        };
        barData: {
            day: string;
            revenue: number;
            expenses: number;
        }[];
        pieData: {
            name: string;
            percent: number;
            color: string;
        }[];
        drivers: {
            id: number;
            name: string;
            points: number;
            returns: number;
            status: string;
        }[];
    }>;
}
