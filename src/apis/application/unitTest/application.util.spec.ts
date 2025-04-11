/* eslint-disable camelcase */
import { DynamoApplicationEntity, UserEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { ApplicationUtil } from '../application.util';
import { mockAmpApplication, mockEmailDto, mockProductDto, mockSimplifiedApplicationDto } from '../mocks';

describe('ApplicationUtil', () => {
    let util: ApplicationUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationUtil,
                {
                    provide: ApplicationQuery,
                    useValue: {
                        getTaskUserIDsByAppID: jest.fn().mockResolvedValue([{ assigned_to: '123456' }]),
                        getApplicationProducts: jest.fn().mockResolvedValue([mockProductDto]),
                        getLinkedProductsByAppID: jest.fn().mockResolvedValue([]),
                        getEmailsByAppID: jest.fn().mockResolvedValue([mockEmailDto]),
                    },
                },
                {
                    provide: 'Amp',
                    useValue: {},
                },
                {
                    provide: UserEntity,
                    useValue: {
                        getUserByID: jest.fn().mockResolvedValue({
                            user_id: '1',
                            first_name: 'John',
                            last_name: 'Doe',
                        }),
                    },
                },
                {
                    provide: DynamoApplicationEntity,
                    useValue: {},
                },
            ],
        }).compile();

        util = module.get(ApplicationUtil);
    });

    it('should generate base formatted application data correctly', async () => {
        const result = await util.getBaseFormattedApplicationData(mockAmpApplication);

        expect(result).toEqual(mockSimplifiedApplicationDto);
    });
});
