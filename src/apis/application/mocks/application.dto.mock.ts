import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';

import { ApplicationDto } from '../dto';
import { mockAgentDto } from './agent.dto.mock';
import { mockAssignedUserDto } from './assignedUser.dto.mock';
import {
    agencyName,
    appID,
    boundDate,
    formattedCreatedDate,
    formattedDate,
    lastStatusUpdate,
    nextYearDate,
    policyNumber,
    submissionID,
    totalCost,
} from './constants.mock';
import { mockEmailDto } from './email.dto.mock';
import { mockInsuredDto } from './insured.dto.mock';
import { mockNoteDto } from './note.dto.mock';
import { mockPricingDto } from './pricing.dto.mock';
import { mockProductDto } from './product.dto.mock';

export const mockApplicationDto: ApplicationDto = {
    id: appID,
    submissionID,
    insured: mockInsuredDto,
    products: mockProductDto,
    agencyName: agencyName,
    agent: mockAgentDto,
    type: ApplicationTypeEnum.NEW,
    assignedUsers: [mockAssignedUserDto],
    status: ApplicationStatusDisplayValueEnum.IN_PROGRESS,
    isMarketplaceApp: false,
    isBundle: true,
    totalCost: String(totalCost),
    policyNumber: policyNumber,
    effectiveDate: formattedDate,
    expirationDate: nextYearDate,
    boundDate: boundDate,
    updatedDate: formattedCreatedDate,
    lastStatusUpdate: lastStatusUpdate,
    claims: [],
    emails: [mockEmailDto],
    notes: [mockNoteDto],
    createdDate: formattedCreatedDate,
    pricing: mockPricingDto,
    autoDeclinationHistory: [],
};
