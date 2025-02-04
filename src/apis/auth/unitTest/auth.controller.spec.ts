import { UserEntity } from '@ignidus/iscx-backend-utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthUtil } from '../auth.util';
import { sessionID, userResponseDtoMock } from '../mocks';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                ConfigService,
                JwtService,
                { provide: UserEntity, useValue: {} },
                { provide: AuthUtil, useValue: {} },
                { provide: JwtService, useValue: {} },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => jest.resetAllMocks());

    describe('/user', () => {
        it('should return an Authorization token in header', async () => {
            jest.spyOn(service, 'findUser').mockResolvedValue(userResponseDtoMock);

            const response = await controller.findUser({ sessionID });

            expect(response).toEqual(userResponseDtoMock);
            expect(service.findUser).toBeCalledTimes(1);
            expect(service.findUser).toBeCalledWith(sessionID);
        });
    });
});
