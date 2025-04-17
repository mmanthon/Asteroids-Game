import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';

import { ApplicationDto } from '../dto';
import { mockAgentDto } from './agent.dto.mock';
import { mockAssignedUserDto } from './assignedUser.dto.mock';
import { mockClaimDto } from './claim.dto.mock';
import { appID, submissionID } from './constants.mock';
import { mockEmailDto } from './email.dto.mock';
import { mockInsuredDto } from './insured.dto.mock';
import { mockNoteDto } from './note.dto.mock';
import { mockProductDto } from './product.dto.mock';

export const mockApplicationDto: ApplicationDto = {
    id: appID,
    submissionID,
    insured: mockInsuredDto,
    products: [mockProductDto],
    agencyName: 'ISC',
    agent: mockAgentDto,
    type: ApplicationTypeEnum.RENEWAL,
    assignedUsers: [mockAssignedUserDto],
    status: ApplicationStatusDisplayValueEnum.IN_PROGRESS,
    isMarketplaceApp: true,
    isBundle: true,
    totalCost: 1000,
    policyNumber: 'AE123456',
    effectiveDate: '21-01-01',
    expirationDate: '2021-01-01',
    boundDate: '2021-01-01',
    updatedDate: '2021-01-01',
    lastStatusUpdate: '2021-01-01',
    claims: [mockClaimDto],
    emails: [mockEmailDto],
    notes: [mockNoteDto],
    createdDate: '2021-01-1',
};
