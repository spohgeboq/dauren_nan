export declare class CreateProductDto {
    name: string;
    categoryId: number;
    sku?: string;
    weight?: number;
    cost?: number;
    price?: number;
    imageUrl?: string;
    description?: string;
    isHit?: boolean;
}
export declare class UpdateProductDto {
    name?: string;
    categoryId?: number;
    weight?: number;
    cost?: number;
    price?: number;
    isActive?: boolean;
    imageUrl?: string;
    description?: string;
    isHit?: boolean;
}
