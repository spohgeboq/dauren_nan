import { PrismaService } from '../prisma/prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(category?: string, month?: string): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        date: Date;
        amount: number;
    }[]>;
    create(data: {
        date?: string;
        category: string;
        description?: string;
        paymentMethod: string;
        amount: number;
    }): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        date: Date;
        amount: number;
    }>;
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
}
