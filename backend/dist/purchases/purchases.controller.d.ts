import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private service;
    constructor(service: PurchasesService);
    findAll(): Promise<({
        supplier: {
            id: number;
            name: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        items: {
            id: number;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            rawMaterialId: number;
            orderedQty: import("@prisma/client/runtime/library").Decimal;
            purchaseId: number;
        }[];
    } & {
        id: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        totalSum: import("@prisma/client/runtime/library").Decimal;
        supplierId: number | null;
        invoiceNumber: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    })[]>;
    getNeeds(): Promise<{
        id: number;
        name: string;
        currentStock: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
        recommendedQty: number;
        unit: string;
    }[]>;
    create(dto: any): Promise<{
        supplier: {
            id: number;
            name: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        items: {
            id: number;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            rawMaterialId: number;
            orderedQty: import("@prisma/client/runtime/library").Decimal;
            purchaseId: number;
        }[];
    } & {
        id: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        totalSum: import("@prisma/client/runtime/library").Decimal;
        supplierId: number | null;
        invoiceNumber: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    }>;
    receive(id: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        totalSum: import("@prisma/client/runtime/library").Decimal;
        supplierId: number | null;
        invoiceNumber: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    } | null>;
    getSuppliers(): Promise<{
        id: number;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createSupplier(dto: any): Promise<{
        id: number;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    paySupplier(id: number, dto: {
        amount: number;
        paymentMethod?: string;
    }): Promise<{
        id: number;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
