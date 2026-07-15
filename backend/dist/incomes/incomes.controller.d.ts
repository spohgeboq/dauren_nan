import { IncomesService } from './incomes.service';
export declare class IncomesController {
    private readonly incomesService;
    constructor(incomesService: IncomesService);
    create(body: {
        amount: number;
        paymentMethod: string;
        source?: string;
        description?: string;
    }): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        source: import(".prisma/client").$Enums.IncomeSource;
        isAuto: boolean;
        userId: number | null;
    }>;
    findAll(month?: string, source?: string): Promise<({
        user: {
            email: string;
            name: string | null;
        } | null;
    } & {
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        source: import(".prisma/client").$Enums.IncomeSource;
        isAuto: boolean;
        userId: number | null;
    })[]>;
    remove(id: string): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        source: import(".prisma/client").$Enums.IncomeSource;
        isAuto: boolean;
        userId: number | null;
    }>;
}
