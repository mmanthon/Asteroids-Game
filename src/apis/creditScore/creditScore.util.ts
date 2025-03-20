import { AmpRolesEnum } from '@ignidus/iscx-backend-utils';
import { Logger } from '@nestjs/common';

import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { MvrApiCreditScoreResponse } from '../../shared/interfaces/mvrApi.interface';

export class CreditScoreUtil {
    private readonly logger = new Logger(CreditScoreUtil.name);

    /**
     * @description Format the response from MVR Credit Score API
     * @param {MvrApiCreditScoreResponse} result
     * @param {string[]} roles
     * @returns {CreditScoreResponseDto}
     */
    formatResponse(result: MvrApiCreditScoreResponse, roles: string[]): CreditScoreResponseDto {
        const response = {
            status: result.creditScore.status,
            appID: result.creditScore.appID,
            actionCode: result.creditScore.actionCode,
            color: result.creditScore.color,
            lastOrderDate: result.creditScore.lastOrderDate,
            drivers: result.creditScore.drivers.map((driver) => ({
                firstName: driver.firstName,
                lastName: driver.lastName,
                dob: driver.dob,
                licenseNum: driver.licenseNum,
            })),
            warnings: result.warnings,
            errors: result.errors,
        };

        if (roles.includes(AmpRolesEnum.BUSINESS_ADMIN)) {
            const adminResponse = {
                ...response,
                score: result.creditScore.score,
                scoreRange: result.creditScore.scoreRange,
            };

            this.logger.log(`Admin Response: ${JSON.stringify(adminResponse)}`);

            return adminResponse;
        }
        this.logger.log(`Response: ${JSON.stringify(response)}`);

        return response;
    }
}
