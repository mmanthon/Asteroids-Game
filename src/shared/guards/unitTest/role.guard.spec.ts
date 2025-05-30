import { IJWT } from '@ignidus/iscx-backend-utils';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { mockRequiredRoles, mockUser, mockUserNoAccess } from '../mocks';
import { RoleGuard } from '../role.guard';

describe('RoleGuard', () => {
    let guard: RoleGuard;
    let reflector: Reflector;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                RoleGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RoleGuard>(RoleGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('canActivate', () => {
        const createMockExecutionContext = (user: IJWT): ExecutionContext =>
            ({
                switchToHttp: () => ({
                    getRequest: () => ({ user }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext);

        it('should allow access when user has required role', async () => {
            (reflector.getAllAndOverride as jest.Mock).mockReturnValue(mockRequiredRoles);
            const context = createMockExecutionContext(mockUser);
            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should deny access when user lacks required role', async () => {
            (reflector.getAllAndOverride as jest.Mock).mockReturnValue(mockRequiredRoles);
            const context = createMockExecutionContext(mockUserNoAccess);
            const result = await guard.canActivate(context);

            expect(result).toBe(false);
        });
    });
});
