import { CashierService } from './cashier.service';
export declare class CashierController {
    private service;
    constructor(service: CashierService);
    getProducts(): Promise<{
        products: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            categoryId: number;
            sku: string;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            stock: number;
        }[];
    }>;
    sell(body: {
        cart: {
            productId: number;
            quantity: number;
            price: number;
        }[];
        paymentMethod: string;
        cashierId: number;
    }): Promise<{
        success: boolean;
        totalAmount: number;
        saleId: number;
    }>;
}
