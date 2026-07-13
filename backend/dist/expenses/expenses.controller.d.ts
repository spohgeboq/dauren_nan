import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private service;
    constructor(service: ExpensesService);
    findAll(category?: string, month?: string): Promise<{
        description: string | null;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        date: Date;
        amount: number;
    }[]>;
    getStats(month?: string): Promise<{
        total: number;
        byCategory: {
            name: string;
            amount: number;
        }[];
        topCategory: {
            name: string;
            amount: number;
        } | null;
    }>;
    create(dto: any): Promise<{
        description: string | null;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        date: Date;
        amount: number;
    }>;
}
