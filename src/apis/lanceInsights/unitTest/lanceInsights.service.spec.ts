import { Test, TestingModule } from '@nestjs/testing';

import { appID } from '../../../apis/application/mocks';
import { LanceInsightsService } from '../lanceInsights.service';
import { LanceInsightsUtil } from '../lanceInsights.util';
import { mockLanceInsightsResponseDto, mockLanceInsightsResponseDtoFail } from '../mocks';

describe('LanceInsightsService', () => {
    let service: LanceInsightsService;
    let lanceInsightsUtil: LanceInsightsUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LanceInsightsService,
                {
                    provide: LanceInsightsUtil,
                    useValue: {
                        createApplicationProductIDArray: jest.fn(),
                        processApprovedRuns: jest.fn(),
                        processFailedRuns: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<LanceInsightsService>(LanceInsightsService);
        lanceInsightsUtil = module.get<LanceInsightsUtil>(LanceInsightsUtil);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(lanceInsightsUtil).toBeDefined();
    });

    describe('getInsights', () => {
        it('should return insights for an application', async () => {
            const mockProductIDs = ['product1', 'product2'];

            jest.spyOn(lanceInsightsUtil, 'createApplicationProductIDArray').mockResolvedValue(mockProductIDs);
            jest.spyOn(lanceInsightsUtil, 'processApprovedRuns').mockResolvedValue([mockLanceInsightsResponseDto]);
            jest.spyOn(lanceInsightsUtil, 'processFailedRuns').mockResolvedValue([mockLanceInsightsResponseDtoFail]);

            const result = await service.getInsights(appID);

            expect(result).toEqual([mockLanceInsightsResponseDto, mockLanceInsightsResponseDtoFail]);
            expect(lanceInsightsUtil.createApplicationProductIDArray).toHaveBeenCalledWith(appID);
            expect(lanceInsightsUtil.processApprovedRuns).toHaveBeenCalledWith(appID, mockProductIDs);
            expect(lanceInsightsUtil.processFailedRuns).toHaveBeenCalledWith(appID, mockProductIDs);
        });
    });
});
