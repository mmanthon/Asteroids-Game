import { AmpRolesEnum, IJWT, ROLES_KEY } from '@ignidus/iscx-backend-utils';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    /**
     * @description Checks whether the requesting user has a necessary role
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     * */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<AmpRolesEnum[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const { user } = context.switchToHttp().getRequest<{ user: IJWT }>();

        return requiredRoles.some((role) => user.roles.includes(role));
    }
}
