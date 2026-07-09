import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private service;
    constructor(service: CategoriesService);
    findAll(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        iconName: string;
        sortOrder: number;
        isActive: boolean;
    })[]>;
    findOne(id: number): Promise<({
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
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        iconName: string;
        sortOrder: number;
        isActive: boolean;
    }) | null>;
    create(dto: CreateCategoryDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        iconName: string;
        sortOrder: number;
        isActive: boolean;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        iconName: string;
        sortOrder: number;
        isActive: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        iconName: string;
        sortOrder: number;
        isActive: boolean;
    }>;
}
