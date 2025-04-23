import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { MvrIntegrationService } from '../../../shared/external';
import { DriverRiskController } from '../driverRisk.controller';
import { DriverRiskQuery } from '../driverRisk.query';
import { DriverRiskService } from '../driverRisk.service';
import { DriverRiskUtil } from '../driverRisk.util';
import { driverRiskResponseMock, populateDriverRiskRequestMock } from '../mocks';
import { appID } from '../mocks/constants';

describe('DriverRiskController', () => {
    let controller: DriverRiskController;
    let service: DriverRiskService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DriverRiskController],
            providers: [
                DriverRiskService,
                {
                    provide: DriverRiskQuery,
                    useValue: {
                        getDriversByAppID: jest.fn(),
                    },
                },
                {
                    provide: MvrIntegrationService,
                    useValue: {
                        fetchDriverData: jest.fn().mockResolvedValue({}),
                        populateDriverData: jest.fn().mockResolvedValue({}),
                    },
                },
                {
                    provide: DriverRiskUtil,
                    useValue: {
                        formatGetResponse: jest.fn().mockReturnValue([]),
                        formatPostResponse: jest.fn().mockReturnValue([]),
                    },
                },
                {
                    provide: ItemEntity,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<DriverRiskController>(DriverRiskController);
        service = module.get<DriverRiskService>(DriverRiskService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('getDriverRisk', () => {
        it('should return driver risk data', async () => {
            jest.spyOn(service, 'getDriverRisk').mockResolvedValue(driverRiskResponseMock);

            const result = await controller.getDriverRisk(appID);

            expect(result).toBe(driverRiskResponseMock);
        });
    });

    describe('populateDriverRisk', () => {
        it('should populate and return driver risk data', async () => {
            jest.spyOn(service, 'populateDriverRisk').mockResolvedValue(driverRiskResponseMock);

            const result = await controller.postDriverRisk(appID, populateDriverRiskRequestMock);

            expect(result).toBe(driverRiskResponseMock);
        });
    });
});
