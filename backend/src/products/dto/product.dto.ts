import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString() name: string;
  @IsInt() categoryId: number;
  @IsString() @IsOptional() sku?: string;
  @IsInt() @IsOptional() weight?: number;
  @IsNumber() @IsOptional() cost?: number;
  @IsNumber() @IsOptional() price?: number;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isHit?: boolean;
}

export class UpdateProductDto {
  @IsString() @IsOptional() name?: string;
  @IsInt() @IsOptional() categoryId?: number;
  @IsInt() @IsOptional() weight?: number;
  @IsNumber() @IsOptional() cost?: number;
  @IsNumber() @IsOptional() price?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isHit?: boolean;
}
