import { AuthenticatedRequest } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { CreditScoreQuery } from './creditScore.query';
import { CreditScoreUtil } from './creditScore.util';
import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { MvrIntegrationService } from '../../shared/external';

@Injectable()
export class CreditScoreService {
    constructor(
        private readonly creditScoreQuery: CreditScoreQuery,
        private readonly creditScoreUtil: CreditScoreUtil,
        public readonly mvrIntegrationService: MvrIntegrationService,
    ) {}

    /**
     * @description Pull credit score data for an application
     * @param {string} appID
     * @param {AuthenticatedRequest['user']} user
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async pullCreditScore(appID: string, { roles }: AuthenticatedRequest['user']): Promise<CreditScoreResponseDto> {
        const drivers = await this.creditScoreQuery.getDriversByAppID(appID);
        const result = await this.mvrIntegrationService.pullCreditScoreData(appID, drivers);
        const creditScoreResponse = this.creditScoreUtil.formatResponse(result, roles);

        return creditScoreResponse;
    }

    /**
     * @description Get credit score data for an application
     * @param {string} appID
     * @param {AuthenticatedRequest['user']} user
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async getCreditScore(appID: string, { roles }: AuthenticatedRequest['user']): Promise<CreditScoreResponseDto> {
        const drivers = await this.creditScoreQuery.getDriversByAppID(appID);
        const result = await this.mvrIntegrationService.getCreditScoreData(appID, drivers);
        const creditScoreResponse = this.creditScoreUtil.formatResponse(result, roles);

        return creditScoreResponse;
    }
}
