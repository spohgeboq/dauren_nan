import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsController {
    private service;
    constructor(service: ProductsService);
    findAll(categoryId?: string): Promise<({
        category: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        sku: string;
        name: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
    })[]>;
    findOne(id: number): Promise<({
        category: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            iconName: string;
            sortOrder: number;
        };
    } & {
        id: number;
        sku: string;
        name: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
    }) | null>;
    create(dto: CreateProductDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        sku: string;
        name: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        sku: string;
        name: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        sku: string;
        name: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
    }>;
}
