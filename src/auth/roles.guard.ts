import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {ROLES_ENUM, ROLES_KEY} from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const accountRole = this.getAccountRole(user?.account_id);

        return requiredRoles?.includes(accountRole) ?? true;
    }

    private getAccountRole(account_id: number) {
        // TODO : 권한 체크 필요
        return ROLES_ENUM.ROLE_ADMIN;
    }
}