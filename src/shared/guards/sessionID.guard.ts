import { UserEntity, extractToken } from '@ignidus/iscx-backend-utils';
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionIDGuard implements CanActivate {
    private readonly logger = new Logger(SessionIDGuard.name);

    constructor(private readonly userEntity: UserEntity) {}

    /**
     * @description Checks if the user has a valid sessionID
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     * */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const authHeader = request.headers.authorization;
            const sessionID = extractToken(authHeader);

            if (!sessionID) throw new UnauthorizedException('Session ID not provided');

            // Check if the sessionID is valid
            const user = await this.userEntity.getUserBySessionID(sessionID);

            if (!user) throw new UnauthorizedException(`User not found for the provided session ID. ${sessionID}`);

            // Store the sessionID in the request object for future use
            request.sessionID = sessionID;

            return true;
        } catch (error) {
            this.logger.error(error);

            throw new UnauthorizedException();
        }
    }
}
