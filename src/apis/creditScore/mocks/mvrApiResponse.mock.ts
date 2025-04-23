import { actionCode1A, appID, color, drivers, lastOrderDate, score, scoreRange, status } from './constants';
import { MvrApiCreditScoreResponse } from '../../../shared/external';

export const mvrApiResponseMock: MvrApiCreditScoreResponse = {
    creditScore: {
        status: status,
        appID: appID,
        score: score,
        scoreRange: scoreRange,
        actionCode: actionCode1A,
        color: color,
        lastOrderDate: lastOrderDate,
        drivers: drivers,
    },
};
