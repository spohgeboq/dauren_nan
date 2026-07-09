import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private service;
    constructor(service: AnalyticsService);
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
