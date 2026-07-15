import { PrismaService } from '../prisma/prisma.service';
import { IncomeSource, PaymentMethod } from '@prisma/client';
export declare class IncomesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        amount: number;
        paymentMethod: PaymentMethod;
        source: IncomeSource;
        description?: string;
        isAuto?: boolean;
        userId?: number;
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
    findAll(params?: {
        month?: string;
        source?: IncomeSource;
    }): Promise<({
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
    remove(id: number): Promise<{
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
