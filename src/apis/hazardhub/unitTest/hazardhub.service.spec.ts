import { Test, TestingModule } from '@nestjs/testing';

import { AmpApiIntegration } from '../../../external';
import { HazardHubQuery } from '../hazardhub.query';
import { HazardhubService } from '../hazardhub.service';
import { HazardHubUtil } from '../hazardhub.util';

describe('HazardhubService', () => {
    let service: HazardhubService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HazardhubService,
                {
                    provide: HazardHubUtil,
                    useValue: {},
                },
                {
                    provide: HazardHubQuery,
                    useValue: {},
                },

                {
                    provide: AmpApiIntegration,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<HazardhubService>(HazardhubService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
