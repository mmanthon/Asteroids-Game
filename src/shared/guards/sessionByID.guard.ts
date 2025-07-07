import { SessionEntity, extractToken } from '@ignidus/iscx-backend-utils';
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionByIDGuard implements CanActivate {
    private readonly logger = new Logger(SessionByIDGuard.name);

    constructor(private readonly sessionEntity: SessionEntity) {}

    /**
     * @description Checks if a session is valid
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
            const session = await this.sessionEntity.getSessionByID(sessionID);

            if (!session) throw new UnauthorizedException(`Session not found for the provided session ID`);

            // Store the sessionID in the request object for future use
            request.sessionID = sessionID;

            return true;
        } catch (error) {
            this.logger.error(error);

            throw new UnauthorizedException();
        }
    }
}
