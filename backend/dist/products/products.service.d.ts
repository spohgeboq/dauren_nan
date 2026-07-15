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
        recipe: {
            id: number;
        } | null;
    } & {
        description: string | null;
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
        isHit: boolean;
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
        description: string | null;
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
        isHit: boolean;
        stock: number;
    }) | null>;
    create(dto: CreateProductDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
        description: string | null;
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
        isHit: boolean;
        stock: number;
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        category: {
            id: number;
            name: string;
        };
    } & {
        description: string | null;
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
        isHit: boolean;
        stock: number;
    }>;
    remove(id: number): Promise<{
        description: string | null;
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
        isHit: boolean;
        stock: number;
    }>;
}
