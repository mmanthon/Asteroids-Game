import { AmpRolesEnum } from '@ignidus/iscx-backend-utils';

import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { MvrApiCreditScoreResponse } from '../../shared/interfaces/mvrApi.interface';

export class CreditScoreUtil {
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
            })),
            warnings: result.warnings,
            errors: result.errors,
        };

        if (roles.includes(AmpRolesEnum.DEVELOPER)) {
            return {
                ...response,
                score: result.creditScore.creditScore,
                scoreRange: result.creditScore.creditScoreRange,
            };
        }

        return response;
    }
}
