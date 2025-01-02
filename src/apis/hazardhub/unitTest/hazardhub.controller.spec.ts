import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { AmpApiIntegration } from '../../../external';
import { HazardhubController } from '../hazardhub.controller';
import { HazardhubService } from '../hazardhub.service';
import { HazardHubUtil } from '../hazardhub.util';

describe('HazardhubController', () => {
    let controller: HazardhubController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HazardhubController],
            providers: [
                HazardhubService,
                {
                    provide: HazardHubUtil,
                    useValue: {},
                },
                {
                    provide: AmpApiIntegration,
                    useValue: {},
                },
                {
                    provide: ItemEntity,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<HazardhubController>(HazardhubController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
