import { AmpRolesEnum, AuthenticatedRequest } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { adminCreditScoreResponseDtoMock, creditScoreResponseDtoMock } from './mocks';

@Injectable()
export class CreditScoreService {
    /**
     * @description Pull Credit Score
     * @param {string} appID
     * @param {AuthenticatedRequest['user']} user
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async pullCreditScore(appID: string, { roles }: AuthenticatedRequest['user']): Promise<CreditScoreResponseDto> {
        // Implement logic to pull credit score from TransUnion
        // Verify if user has proper roler
        if (roles.includes(AmpRolesEnum.DEVELOPER)) {
            return { ...adminCreditScoreResponseDtoMock, appID };
        }

        return { ...creditScoreResponseDtoMock, appID };
    }

    /**
     * @description Get Credit Score
     * @param {string} appID
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async getCreditScore(appID: string, { roles }: AuthenticatedRequest['user']): Promise<CreditScoreResponseDto> {
        // Implement logic to get credit score from Itrans API
        if (roles.includes(AmpRolesEnum.DEVELOPER)) {
            return { ...adminCreditScoreResponseDtoMock, appID };
        }

        return { ...creditScoreResponseDtoMock, appID };
    }
}
