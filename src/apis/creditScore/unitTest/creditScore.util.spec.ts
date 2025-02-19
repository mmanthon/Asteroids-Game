import { Test, TestingModule } from '@nestjs/testing';

import { CreditScoreUtil } from '../creditScore.util';
import {
    adminCreditScoreResponseDtoMock,
    adminRoleArrayMock,
    creditScoreResponseDtoMock,
    mvrApiResponseMock,
    nonAdminRoleArrayMock,
} from '../mocks';

describe('CreditScoreUtil', () => {
    let creditScoreUtil: CreditScoreUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreditScoreUtil],
        }).compile();

        creditScoreUtil = module.get<CreditScoreUtil>(CreditScoreUtil);
    });

    it('should be defined', () => {
        expect(creditScoreUtil).toBeDefined();
    });

    it('should return admin credit score response for developer role', () => {
        const response = creditScoreUtil.formatResponse(mvrApiResponseMock, adminRoleArrayMock);

        expect(response).toEqual(adminCreditScoreResponseDtoMock);
    });

    it('should return non-admin credit score response for non-developer role', () => {
        const response = creditScoreUtil.formatResponse(mvrApiResponseMock, nonAdminRoleArrayMock);

        expect(response).toEqual(creditScoreResponseDtoMock);
    });
});
