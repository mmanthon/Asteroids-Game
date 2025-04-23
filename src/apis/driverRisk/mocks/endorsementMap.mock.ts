import { EndorsementStatusDisplayValueEnum } from '@ignidus/iscx-backend-utils';

import { endorsementBoundDate, endorsementCreatedDate, endorsementID, license } from './constants';
import { EndorsementDto } from '../dto';

export const endorsementMapMock: Map<string, EndorsementDto> = new Map([
    [
        license,
        {
            id: endorsementID,
            createdDate: endorsementCreatedDate,
            status: EndorsementStatusDisplayValueEnum.APPROVAL_REQUESTED,
            boundDate: endorsementBoundDate,
        },
    ],
]);
