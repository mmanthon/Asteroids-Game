import { SessionEntity, SessionModel } from '@ignidus/iscx-backend-utils';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { authHeader, sessionID } from '../mocks';
import { SessionByIDGuard } from '../sessionByID.guard';

describe('SessionByIDGuard', () => {
    let guard: SessionByIDGuard;
    let sessionEntity: SessionEntity;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [SessionByIDGuard, { provide: SessionEntity, useValue: { getSessionByID: jest.fn() } }],
        }).compile();

        guard = module.get<SessionByIDGuard>(SessionByIDGuard);
        sessionEntity = module.get<SessionEntity>(SessionEntity);
    });

    afterEach(() => jest.resetAllMocks());

    describe('canActivate', () => {
        const err = new UnauthorizedException();

        it('should reject for missing header', async () => {
            const executionContext = mockExecutionContext(undefined);
            const canActivate = guard.canActivate(executionContext);

            await expect(canActivate).rejects.toEqual(err);
        });

        it('should reject for missing prefix', async () => {
            const executionContext = mockExecutionContext(sessionID);
            const canActivate = guard.canActivate(executionContext);

            await expect(canActivate).rejects.toEqual(err);
        });

        it('should reject for invalid sessionID', async () => {
            jest.spyOn(sessionEntity, 'getSessionByID').mockResolvedValue(null);

            const executionContext = mockExecutionContext(authHeader);
            const canActivate = guard.canActivate(executionContext);

            await expect(canActivate).rejects.toEqual(err);
        });

        it('should resolve true for a valid sessionID', async () => {
            // none of the properties are accessed, just needs to be truthy
            jest.spyOn(sessionEntity, 'getSessionByID').mockResolvedValue({} as SessionModel);

            const executionContext = mockExecutionContext(authHeader);
            const request = executionContext.switchToHttp().getRequest();
            const canActivate = await guard.canActivate(executionContext);

            expect(canActivate).toEqual(true);
            expect(sessionEntity.getSessionByID).toBeCalledTimes(1);
            expect(sessionEntity.getSessionByID).toBeCalledWith(sessionID);
            expect(request.sessionID).toEqual(sessionID);
        });
    });

    function mockExecutionContext(authHeader: string) {
        const request: any = { headers: { authorization: authHeader } };
        const switchToHttp = () => ({ getRequest: () => request });

        return { switchToHttp } as ExecutionContext;
    }
});
