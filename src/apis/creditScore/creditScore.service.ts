import { Injectable } from '@nestjs/common';

import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { mockAdminCreditScoreResponse, mockCreditScoreResponse } from './mocks';

@Injectable()
export class CreditScoreService {
    /**
     * @description Pull Credit Score
     * @param {string} appID
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async pullCreditScore(appID: string): Promise<CreditScoreResponseDto> {
        // Implement logic to pull credit score from TransUnion
        return { ...mockCreditScoreResponse, appID };
    }

    /**
     * @description Get Credit Score
     * @param {string} appID
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async getCreditScore(appID: string): Promise<CreditScoreResponseDto> {
        // Implement logic to get credit score from Itrans API
        return { ...mockAdminCreditScoreResponse, appID };
    }
}
