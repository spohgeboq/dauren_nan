import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    login?: string;
    pin?: string;
    role?: Role;
    fixedSalary?: number;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    role?: Role;
    status?: string;
    login?: string;
    password?: string;
    fixedSalary?: number;
}
