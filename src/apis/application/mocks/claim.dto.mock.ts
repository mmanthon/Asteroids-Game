import { ClaimStatusEnum } from '@ignidus/iscx-backend-utils';

import { ClaimDto } from '../dto';
import { appID, claimID, createdDate, jdiID, updatedDate } from './constants.mock';

export const mockClaimDto: ClaimDto = {
    id: claimID,
    jdiID,
    appID,
    status: ClaimStatusEnum.OPEN,
    requestedAmount: 1000,
    updatedDate: updatedDate,
    createdDate: createdDate,
};
