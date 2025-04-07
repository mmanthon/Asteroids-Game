import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { AmpApiIntegration } from '../../../shared/external';
import { HazardhubController } from '../hazardhub.controller';
import { HazardHubQuery } from '../hazardhub.query';
import { HazardhubService } from '../hazardhub.service';
import { HazardHubUtil } from '../hazardhub.util';
import { appID } from '../mocks/constants';
import { hazardhubResponseDtoMock } from '../mocks/hazardhubResponse.dto.mock';

describe('HazardhubController', () => {
    let controller: HazardhubController;
    let service: HazardhubService;

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
                    provide: HazardHubQuery,
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
        service = module.get<HazardhubService>(HazardhubService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return hazardhub data by appID', async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue([hazardhubResponseDtoMock]);

        const result = await controller.findOne(appID);

        expect(result).toEqual([hazardhubResponseDtoMock]);
        expect(service.findOne).toHaveBeenCalledWith(appID);
    });
});
