import { Test, TestingModule } from '@nestjs/testing';

import { AmpApiIntegration } from '../../../shared/external';
import { HazardHubQuery } from '../hazardhub.query';
import { HazardhubService } from '../hazardhub.service';
import { HazardHubUtil } from '../hazardhub.util';
import { appID, mockAddress } from '../mocks/constants';
import { expectedHazardhubResponse, mockHazardhubData } from '../mocks/hazardhubResponse.dto.mock';

describe('HazardhubService', () => {
    let service: HazardhubService;
    let hazardHubUtil: HazardHubUtil;
    let hazardhubQuery: HazardHubQuery;
    let ampApiIntegration: AmpApiIntegration;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HazardhubService,
                {
                    provide: HazardHubUtil,
                    useValue: {
                        validateAddress: jest.fn(),
                    },
                },
                {
                    provide: HazardHubQuery,
                    useValue: {
                        getApplicationAddress: jest.fn().mockResolvedValue(mockAddress),
                    },
                },

                {
                    provide: AmpApiIntegration,
                    useValue: {
                        getHazardhubData: jest.fn().mockResolvedValue(mockHazardhubData),
                    },
                },
            ],
        }).compile();

        service = module.get<HazardhubService>(HazardhubService);
        hazardHubUtil = module.get<HazardHubUtil>(HazardHubUtil);
        hazardhubQuery = module.get<HazardHubQuery>(HazardHubQuery);
        ampApiIntegration = module.get<AmpApiIntegration>(AmpApiIntegration);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return merged hazardhub data', async () => {
        const result = await service.findOne(appID);

        expect(hazardhubQuery.getApplicationAddress).toHaveBeenLastCalledWith(appID);

        expect(hazardHubUtil.validateAddress).toHaveBeenCalledWith(mockAddress);
        expect(ampApiIntegration.getHazardhubData).toHaveBeenLastCalledWith(mockAddress);
        expect(result).toMatchObject([expectedHazardhubResponse]);
    });

    it('should throw if address is invalid', async () => {
        (hazardHubUtil.validateAddress as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid address');
        });
        await expect(service.findOne(appID)).rejects.toThrow('Invalid address');
    });
});
