import { Decipher, createDecipheriv } from 'crypto';

import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { MvrIntegrationService } from '../../../shared/external';
import { DriverRiskQuery } from '../driverRisk.query';
import { DriverRiskService } from '../driverRisk.service';
import { DriverRiskUtil } from '../driverRisk.util';
import {
    driverQueryResultMock,
    driverRiskResponseMock,
    endorsementMapMock,
    endorsementQueryResult,
    licenseNumbersMock,
    mvrDriverResponseMock,
    mvrPopulateDriverResponseMock,
    populateDriverRiskRequestMock,
} from '../mocks';
import { appID } from '../mocks/constants';

jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    createDecipheriv: jest.fn(),
}));

describe('DriverRiskService', () => {
    let service: DriverRiskService;
    let mvrIntegrationService: MvrIntegrationService;
    let driverRiskQuery: DriverRiskQuery;
    let driverRiskUtil: DriverRiskUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DriverRiskService,
                {
                    provide: DriverRiskQuery,
                    useValue: {
                        getDriversByAppID: jest.fn(),
                        getEndorsementsByAppID: jest.fn(),
                        getDriverByLicenseNumber: jest.fn(),
                    },
                },
                {
                    provide: MvrIntegrationService,
                    useValue: {
                        fetchDriverData: jest.fn(),
                        populateDriverData: jest.fn(),
                    },
                },
                {
                    provide: DriverRiskUtil,
                    useValue: {
                        formatResponse: jest.fn(),
                        formatPopulateResponse: jest.fn(),
                        getDriverData: jest.fn(),
                    },
                },
                {
                    provide: ItemEntity,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<DriverRiskService>(DriverRiskService);
        mvrIntegrationService = module.get<MvrIntegrationService>(MvrIntegrationService);
        driverRiskQuery = module.get<DriverRiskQuery>(DriverRiskQuery);
        driverRiskUtil = module.get<DriverRiskUtil>(DriverRiskUtil);

        (createDecipheriv as jest.Mock).mockReturnValue({
            update: jest.fn().mockReturnValue(Buffer.from(endorsementQueryResult.data, 'base64')),
            final: jest.fn().mockReturnValue(Buffer.from(endorsementQueryResult.data, 'base64')),
        } as unknown as Decipher);
    });

    it('should get driver risk data for an application', async () => {
        jest.spyOn(driverRiskUtil, 'getDriverData').mockResolvedValue({
            drivers: driverQueryResultMock,
            endorsementMap: endorsementMapMock,
        });
        jest.spyOn(mvrIntegrationService, 'fetchDriverData').mockResolvedValue(mvrDriverResponseMock);
        jest.spyOn(driverRiskUtil, 'formatResponse').mockReturnValue(driverRiskResponseMock);

        const result = await service.getDriverRisk(appID);

        expect(result).toEqual(driverRiskResponseMock);
        expect(driverRiskUtil.getDriverData).toHaveBeenCalledWith(appID);
        expect(mvrIntegrationService.fetchDriverData).toHaveBeenCalledWith(driverQueryResultMock);
    });

    it('should populate driver risk data for an application', async () => {
        jest.spyOn(driverRiskQuery, 'getDriversByAppID').mockResolvedValue(driverQueryResultMock);
        jest.spyOn(driverRiskQuery, 'getEndorsementsByAppID').mockResolvedValue([endorsementQueryResult]);
        jest.spyOn(driverRiskQuery, 'getDriverByLicenseNumber').mockResolvedValue(driverQueryResultMock[0]);
        jest.spyOn(mvrIntegrationService, 'populateDriverData').mockResolvedValue(mvrPopulateDriverResponseMock);
        jest.spyOn(driverRiskUtil, 'formatResponse').mockReturnValue(driverRiskResponseMock);
        jest.spyOn(JSON, 'parse').mockReturnValue({ mock: 'test' });

        const result = await service.populateDriverRisk(appID, populateDriverRiskRequestMock);

        expect(result).toEqual(driverRiskResponseMock);
        expect(driverRiskQuery.getDriverByLicenseNumber).toHaveBeenCalledWith(licenseNumbersMock[0]);
    });
});
