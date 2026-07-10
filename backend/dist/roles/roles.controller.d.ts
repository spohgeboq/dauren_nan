import { RolesService } from './roles.service';
export declare class RolesController {
    private service;
    constructor(service: RolesService);
    findAll(): Promise<{
        employeeCount: number;
        isSystemAdmin: boolean;
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    findOne(id: number): Promise<{
        employeeCount: number;
        isSystemAdmin: boolean;
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    } | null>;
    create(dto: any): Promise<{
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    update(id: number, dto: any): Promise<{
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updatePermission(id: number, module: string, dto: any): Promise<{
        id: number;
        module: string;
        roleId: number;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
}
