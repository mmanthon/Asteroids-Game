import { actionCode1A, appID, color, drivers, lastOrderDate, score, scoreRange, status } from './constants';
import { CreditScoreResponseDto } from '../dto/creditScoreResponse.dto';

export const adminCreditScoreResponseDtoMock: CreditScoreResponseDto = {
    status: status,
    appID: appID,
    score: score,
    scoreRange: scoreRange,
    actionCode: actionCode1A,
    color: color,
    lastOrderDate: lastOrderDate,
    drivers,
};

export const creditScoreResponseDtoMock: CreditScoreResponseDto = {
    status: status,
    appID: appID,
    actionCode: actionCode1A,
    color: color,
    lastOrderDate: lastOrderDate,
    drivers,
};
