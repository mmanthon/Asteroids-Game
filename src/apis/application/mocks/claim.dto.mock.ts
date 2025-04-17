import { ClaimStatusEnum } from '@ignidus/iscx-backend-utils';

import { ClaimDto } from '../dto';
import { appID } from './constants.mock';

export const mockClaimDto: ClaimDto = {
    id: '123456',
    jdiID: '123456',
    appID,
    status: ClaimStatusEnum.OPEN,
    requestedAmount: 1000,
    updatedDate: '2021-01-01',
    createdDate: '2021-01-01',
};
