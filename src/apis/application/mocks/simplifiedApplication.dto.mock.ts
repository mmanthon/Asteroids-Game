import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';

import { SimplifiedApplicationDto } from '../dto';
import { mockAmpApplication } from './ampApplication.interface.mock';
import { mockAssignedUserDto } from './assignedUser.dto.mock';
import { submissionID } from './constants.mock';
import { mockPricingDto } from './pricing.dto.mock';
import { mockProductDto } from './product.dto.mock';

export const mockSimplifiedApplicationDto: SimplifiedApplicationDto = {
    id: String(mockAmpApplication.item_id),
    submissionID: submissionID,
    insured: {
        firstName: mockAmpApplication.insured_first_name,
        lastName: mockAmpApplication.insured_last_name,
        companyName: mockAmpApplication.insured_company_name,
        phoneNumber: mockAmpApplication.insured_phone,
        email: mockAmpApplication.insured_email,
        address: {
            streetAddress: mockAmpApplication.insured_address,
            city: mockAmpApplication.insured_city,
            state: mockAmpApplication.insured_state,
            zip: mockAmpApplication.insured_zip,
        },
    },
    products: mockProductDto,
    agencyName: mockAmpApplication.agency_name,
    type: ApplicationTypeEnum.NEW,
    assignedUsers: [mockAssignedUserDto],
    status: mockAmpApplication.status_name as ApplicationStatusDisplayValueEnum,
    isMarketplaceApp: false,
    isBundle: true,
    totalCost: Number(mockAmpApplication.total_cost),
    effectiveDate: mockAmpApplication.effective_date,
    expirationDate: '2026-04-01',
    boundDate: mockAmpApplication.first_bound_date,
    lastStatusUpdate: mockAmpApplication.last_status_update,
    pricing: mockPricingDto,
};
