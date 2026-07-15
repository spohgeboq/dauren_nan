import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private service;
    constructor(service: ExpensesService);
    findAll(category?: string, month?: string): Promise<({
        user: {
            email: string;
            id: number;
            passwordHash: string;
            name: string | null;
            phone: string | null;
            login: string | null;
            pin: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            isOnShift: boolean;
            fixedSalary: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            clientId: number | null;
        } | null;
        vehicle: {
            id: number;
            status: import(".prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            driverId: number | null;
            brandModel: string;
            licensePlate: string;
            capacityTrays: number;
            fuelConsumption: number;
        } | null;
        supplierPayments: ({
            supplier: {
                id: number;
                name: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                balance: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            expenseId: number | null;
            supplierId: number;
        })[];
    } & {
        description: string | null;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        isAuto: boolean;
        userId: number | null;
        vehicleId: number | null;
    })[]>;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        isAuto: boolean;
        userId: number | null;
        vehicleId: number | null;
    }>;
    paySalaries(): Promise<{
        success: boolean;
        paidCount: number;
        expenses: {
            description: string | null;
            category: import(".prisma/client").$Enums.ExpenseCategory;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            isAuto: boolean;
            userId: number | null;
            vehicleId: number | null;
        }[];
    }>;
    delete(id: string): Promise<{
        description: string | null;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        isAuto: boolean;
        userId: number | null;
        vehicleId: number | null;
    }>;
}
