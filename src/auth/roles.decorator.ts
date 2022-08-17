import {SetMetadata} from "@nestjs/common";

export enum ROLES_ENUM {
    ROLE_ADMIN = 'admin',
    ROLE_USER = 'user'
};
export const ROLES_KEY = 'roles';
export const Role = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);