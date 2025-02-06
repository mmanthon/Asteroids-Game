import { actionCode1A, actionCode2B, appID, drivers, lastOrderDate, score, scoreRange, status } from './constants';
import { CreditScoreResponseDto } from '../dto/creditScoreResponse.dto';

export const mockAdminCreditScoreResponse: CreditScoreResponseDto = {
    status: status,
    appID: appID,
    score: score,
    scoreRange: scoreRange,
    actionCode: actionCode1A,
    lastOrderDate: lastOrderDate,
    drivers,
};

export const mockCreditScoreResponse: CreditScoreResponseDto = {
    status: status,
    appID: appID,
    actionCode: actionCode2B,
    lastOrderDate: lastOrderDate,
    drivers,
};
