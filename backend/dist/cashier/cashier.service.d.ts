import { PrismaService } from '../prisma/prisma.service';
export declare class CashierService {
    private prisma;
    constructor(prisma: PrismaService);
    getProducts(): Promise<{
        products: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sku: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            stock: number;
        }[];
    }>;
    sell(cart: {
        productId: number;
        quantity: number;
        price: number;
    }[], paymentMethod: string, cashierId: number): Promise<{
        success: boolean;
        totalAmount: number;
        saleId: number;
    }>;
}
