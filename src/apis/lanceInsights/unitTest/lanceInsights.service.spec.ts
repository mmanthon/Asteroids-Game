import { Test, TestingModule } from '@nestjs/testing';

import { LanceInsightsService } from '../lanceInsights.service';
import { LanceInsightsUtil } from '../lanceInsights.util';

describe('LanceInsightsService', () => {
    let service: LanceInsightsService;
    let lanceInsightsUtil: LanceInsightsUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LanceInsightsService, { provide: LanceInsightsUtil, useValue: {} }],
        }).compile();

        service = module.get<LanceInsightsService>(LanceInsightsService);
        lanceInsightsUtil = module.get<LanceInsightsUtil>(LanceInsightsUtil);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(lanceInsightsUtil).toBeDefined();
    });
});
