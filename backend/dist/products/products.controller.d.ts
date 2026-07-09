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
    })[]>;
    findOne(id: number): Promise<({
        category: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            iconName: string;
            sortOrder: number;
            isActive: boolean;
        };
    } & {
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
    }) | null>;
    create(dto: CreateProductDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
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
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
