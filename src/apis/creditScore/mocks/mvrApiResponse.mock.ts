import { actionCode1A, appID, color, drivers, lastOrderDate, score, scoreRange, status } from './constants';
import { MvrApiCreditScoreResponse } from '../../../shared/interfaces';

export const mvrApiResponseMock: MvrApiCreditScoreResponse = {
    creditScore: {
        status: status,
        appID: appID,
        creditScore: score,
        creditScoreRange: scoreRange,
        actionCode: actionCode1A,
        color: color,
        lastOrderDate: lastOrderDate,
        drivers: drivers,
    },
};
