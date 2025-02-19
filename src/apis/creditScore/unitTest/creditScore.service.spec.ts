/* eslint-disable camelcase */
import { Test, TestingModule } from '@nestjs/testing';

import { MvrApiException } from '../../../shared/exceptions/mvrApi.exception';
import { MvrIntegrationService } from '../../../shared/external/mvrIntegration.external';
import { CreditScoreQuery } from '../creditScore.query';
import { CreditScoreService } from '../creditScore.service';
import { CreditScoreUtil } from '../creditScore.util';
import {
    adminCreditScoreResponseDtoMock,
    adminJwtMock,
    creditScoreResponseDtoMock,
    jwtMock,
    mockDriverQueryResult,
} from '../mocks';

const mockFormatResponse = jest.fn().mockResolvedValue(adminCreditScoreResponseDtoMock);

describe('CreditScoreService', () => {
    let service: CreditScoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreditScoreService,
                CreditScoreQuery,
                {
                    provide: CreditScoreUtil,
                    useValue: {
                        formatResponse: mockFormatResponse,
                    },
                },
                {
                    provide: MvrIntegrationService,
                    useValue: {
                        pullCreditScoreData: jest.fn().mockResolvedValue(adminCreditScoreResponseDtoMock),
                        getCreditScoreData: jest.fn().mockResolvedValue(adminCreditScoreResponseDtoMock),
                    },
                },
                {
                    provide: 'Amp',
                    useValue: {
                        select: jest.fn().mockReturnThis(),
                        from: jest.fn().mockReturnThis(),
                        where: jest.fn().mockReturnThis(),
                        andWhere: jest.fn().mockReturnThis(),
                        groupBy: jest.fn().mockResolvedValue(mockDriverQueryResult),
                    },
                },
            ],
        }).compile();

        service = module.get<CreditScoreService>(CreditScoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return admin credit score response for developer role', async () => {
        const result = await service.pullCreditScore('12345', adminJwtMock);

        expect(result).toEqual({ ...adminCreditScoreResponseDtoMock, appID: '12345' });
    });

    it('should return non-admin credit score response for non-developer role', async () => {
        mockFormatResponse.mockResolvedValue(creditScoreResponseDtoMock);

        const result = await service.pullCreditScore('12345', jwtMock);

        expect(result).toEqual({ ...creditScoreResponseDtoMock, appID: '12345' });
    });

    it('should handle a failed call with an MvrApiException', async () => {
        const mvrApiException = new MvrApiException('Failed to pull credit score data');

        jest.spyOn(service.mvrIntegrationService, 'pullCreditScoreData').mockRejectedValue(mvrApiException);

        await expect(service.pullCreditScore('12345', jwtMock)).rejects.toThrow(MvrApiException);
    });
});
