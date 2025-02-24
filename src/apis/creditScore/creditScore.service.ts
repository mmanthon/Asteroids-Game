import { AuthenticatedRequest } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreditScoreQuery } from './creditScore.query';
import { CreditScoreUtil } from './creditScore.util';
import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { MvrIntegrationService } from '../../shared/external';
import { GetDriverQueryResult } from '../../shared/interfaces';

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

        // If there is only 1 driver or no drivers, return an 400 and error message in the response
        this.validateDrivers(drivers);
        const result = await this.mvrIntegrationService.pullCreditScoreData(appID, drivers);

        return this.creditScoreUtil.formatResponse(result, roles);
    }

    /**
     * @description Get credit score data for an application
     * @param {string} appID
     * @param {AuthenticatedRequest['user']} user
     * @returns {Promise<CreditScoreResponseDto>}
     */
    async getCreditScore(appID: string, { roles }: AuthenticatedRequest['user']): Promise<CreditScoreResponseDto> {
        const drivers = await this.creditScoreQuery.getDriversByAppID(appID);

        // If there is only 1 driver or no drivers, return an 400 and error message in the response
        this.validateDrivers(drivers);
        const result = await this.mvrIntegrationService.getCreditScoreData(appID, drivers);

        return this.creditScoreUtil.formatResponse(result, roles);
    }

    /**
     * @description Validate the drivers array and make sure there are at least 2 drivers
     * @param {GetDriverQueryResult[]} drivers
     * @throws {BadRequestException} If there are 1 or fewer drivers
     */
    private validateDrivers(drivers: GetDriverQueryResult[]): void {
        if (drivers.length <= 1) {
            throw new BadRequestException(
                'There are not at least 2 drivers on this application. Please add more drivers to pull credit score data.',
            );
        }
    }
}
