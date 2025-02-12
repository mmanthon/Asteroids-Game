import { Test, TestingModule } from '@nestjs/testing';

import { CreditScoreService } from '../creditScore.service';
import { mockJWT } from '../mocks';
import { adminCreditScoreResponseDtoMock } from '../mocks/creditScoreResponse.dto.mock';

describe('CreditScoreService', () => {
    let service: CreditScoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreditScoreService],
        }).compile();

        service = module.get<CreditScoreService>(CreditScoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return admin credit score response for developer role', async () => {
        const result = await service.pullCreditScore('12345', mockJWT);

        expect(result).toEqual({ ...adminCreditScoreResponseDtoMock, appID: '12345' });
    });
});
