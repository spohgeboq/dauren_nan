import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(categoryId?: number): Promise<({
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
        sku: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        imageUrl: string | null;
        stock: number;
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
        sku: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        imageUrl: string | null;
        stock: number;
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
        sku: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        imageUrl: string | null;
        stock: number;
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
        sku: string;
        categoryId: number;
        weight: number;
        cost: number;
        price: number;
        imageUrl: string | null;
        stock: number;
    }>;
    remove(id: number): Promise<{
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
    }>;
}
