import { Test, TestingModule } from '@nestjs/testing';

import { LanceInsightsController } from '../lanceInsights.controller';
import { LanceInsightsService } from '../lanceInsights.service';
import { LanceInsightsUtil } from '../lanceInsights.util';

describe('LanceInsightsController', () => {
    let controller: LanceInsightsController;
    let service: LanceInsightsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LanceInsightsController],
            providers: [
                LanceInsightsService,
                { provide: LanceInsightsUtil, useValue: {} },
                // { provide: TrackingLanceInsightsQueries, useValue: {} },
                // { provide: ProductResponseUtil, useValue: {} },
                // { provide: ProductResponseUtil, useValue: {} },
            ],
        }).compile();

        controller = module.get<LanceInsightsController>(LanceInsightsController);
        service = module.get<LanceInsightsService>(LanceInsightsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });
});
