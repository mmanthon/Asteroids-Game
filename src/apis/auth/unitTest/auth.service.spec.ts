import { DynamoUserEntity } from '@ignidus/iscx-backend-utils';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service';
import { AuthUtil } from '../auth.util';
import { jwt, jwtClaimMock, sessionID, userInfoDtoMock, userResponseDtoMock } from '../mocks';

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;
    let authUtil: AuthUtil;
    let dynamoUserEntity: DynamoUserEntity;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: AuthUtil,
                    useValue: {
                        getUserInfo: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
                {
                    provide: DynamoUserEntity,
                    useValue: {
                        findOneByIdentifier: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        authUtil = module.get<AuthUtil>(AuthUtil);
        dynamoUserEntity = module.get<DynamoUserEntity>(DynamoUserEntity);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getUserInfo', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should return a user info dto', async () => {
            jest.spyOn(authUtil, 'getUserInfo').mockResolvedValue(userInfoDtoMock);
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwt);

            const response = await service.findUser(sessionID);

            expect(response).toEqual(userResponseDtoMock);
            expect(authUtil.getUserInfo).toBeCalledTimes(1);
            expect(authUtil.getUserInfo).toBeCalledWith(sessionID);
            expect(jwtService.signAsync).toBeCalledTimes(1);
            expect(jwtService.signAsync).toBeCalledWith(jwtClaimMock);
        });

        it('should return a user info dto without iscx user', async () => {
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue(null);
            jest.spyOn(authUtil, 'getUserInfo').mockResolvedValue(userInfoDtoMock);
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwt);

            const response = await service.findUser(sessionID);

            expect(response).toEqual(userResponseDtoMock);
            expect(authUtil.getUserInfo).toBeCalledTimes(1);
            expect(authUtil.getUserInfo).toBeCalledWith(sessionID);
            expect(jwtService.signAsync).toBeCalledTimes(1);
            expect(jwtService.signAsync).toBeCalledWith(jwtClaimMock);
        });
    });
});
