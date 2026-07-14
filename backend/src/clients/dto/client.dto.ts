import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateClientDto {
  @IsString() name: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() ownerName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() deliveryTime?: string;
  @IsString() @IsOptional() login?: string;
  @IsString() @IsOptional() password?: string;
}

export class UpdateClientDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() ownerName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() route?: string;
  @IsNumber() @IsOptional() balance?: number;
  @IsString() @IsOptional() deliveryTime?: string;
}
