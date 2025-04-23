import { AuthenticatedRequest, ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { MvrIntegrationService } from '../../../shared/external/mvr/mvr.external';
import { AppIDValidator } from '../../../shared/validators/appID.validator';
import { CreditScoreController } from '../creditScore.controller';
import { CreditScoreQuery } from '../creditScore.query';
import { CreditScoreService } from '../creditScore.service';
import { CreditScoreUtil } from '../creditScore.util';
import { adminJwtMock, appID } from '../mocks';
import { adminCreditScoreResponseDtoMock } from '../mocks/creditScoreResponse.dto.mock';

describe('CreditScoreController', () => {
    let controller: CreditScoreController;
    let service: CreditScoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CreditScoreController],
            providers: [
                CreditScoreService,
                CreditScoreQuery,
                CreditScoreUtil,
                AppIDValidator,
                {
                    provide: ItemEntity,
                    useValue: {},
                },
                {
                    provide: MvrIntegrationService,
                    useValue: {},
                },
                {
                    provide: 'Amp',
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<CreditScoreController>(CreditScoreController);
        service = module.get<CreditScoreService>(CreditScoreService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    it('should call pullCreditScore with valid appID', async () => {
        const mockRequest: AuthenticatedRequest = {
            user: adminJwtMock,
        } as AuthenticatedRequest;

        jest.spyOn(service, 'pullCreditScore').mockResolvedValue(adminCreditScoreResponseDtoMock);

        expect(await controller.pullCreditScore(appID, mockRequest)).toBe(adminCreditScoreResponseDtoMock);
        expect(service.pullCreditScore).toHaveBeenCalledWith(appID, mockRequest.user);
    });
});
