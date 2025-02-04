import { UserEntity, UserModel } from '@ignidus/iscx-backend-utils';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { authHeader, sessionID } from '../mocks';
import { SessionIDGuard } from '../sessionID.guard';

describe('SessionIDGuard', () => {
    let guard: SessionIDGuard;
    let userEntity: UserEntity;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [SessionIDGuard, { provide: UserEntity, useValue: { getUserBySessionID: jest.fn() } }],
        }).compile();

        guard = module.get<SessionIDGuard>(SessionIDGuard);
        userEntity = module.get<UserEntity>(UserEntity);
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
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(null);

            const executionContext = mockExecutionContext(authHeader);
            const canActivate = guard.canActivate(executionContext);

            await expect(canActivate).rejects.toEqual(err);
        });

        it('should resolve true for a valid sessionID', async () => {
            // none of the properties are accessed, just needs to be truthy
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue({} as UserModel);

            const executionContext = mockExecutionContext(authHeader);
            const request = executionContext.switchToHttp().getRequest();
            const canActivate = await guard.canActivate(executionContext);

            expect(canActivate).toEqual(true);
            expect(userEntity.getUserBySessionID).toBeCalledTimes(1);
            expect(userEntity.getUserBySessionID).toBeCalledWith(sessionID);
            expect(request.sessionID).toEqual(sessionID);
        });
    });

    function mockExecutionContext(authHeader: string) {
        const request: any = { headers: { authorization: authHeader } };
        const switchToHttp = () => ({ getRequest: () => request });

        return { switchToHttp } as ExecutionContext;
    }
});
