import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(role?: string): Promise<{
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        login: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        fixedSalary: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        login: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        fixedSalary: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
    } | null>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        login: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        fixedSalary: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        login: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        fixedSalary: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        email: string;
        passwordHash: string;
        name: string | null;
        phone: string | null;
        login: string | null;
        pin: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        fixedSalary: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        clientId: number | null;
    }>;
}
