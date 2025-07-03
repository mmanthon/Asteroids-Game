import { Test, TestingModule } from '@nestjs/testing';

import { appID } from '../../../apis/application/mocks';
import { LanceInsightsController } from '../lanceInsights.controller';
import { LanceInsightsService } from '../lanceInsights.service';
import { LanceInsightsUtil } from '../lanceInsights.util';
import { mockLanceInsightsResponseDto } from '../mocks';

describe('LanceInsightsController', () => {
    let controller: LanceInsightsController;
    let service: LanceInsightsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LanceInsightsController],
            providers: [LanceInsightsService, { provide: LanceInsightsUtil, useValue: {} }],
        }).compile();

        controller = module.get<LanceInsightsController>(LanceInsightsController);
        service = module.get<LanceInsightsService>(LanceInsightsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('getLanceInsights', () => {
        it('should return Lance Insights for an application', async () => {
            jest.spyOn(service, 'getInsights').mockResolvedValue([mockLanceInsightsResponseDto]);

            const result = await controller.getLanceInsights(appID);

            expect(result).toEqual([mockLanceInsightsResponseDto]);
            expect(service.getInsights).toHaveBeenCalledWith(appID);
        });
    });
});
