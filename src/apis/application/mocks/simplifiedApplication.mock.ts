import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';

import { SimplifiedApplicationDto } from '../dto';

export const mockSimplifiedApplication: SimplifiedApplicationDto = {
    id: '1',
    submissionID: '',
    insured: {
        firstName: '',
        lastName: '',
        companyName: '',
        phoneNumber: '',
        email: '',
        address: {
            streetAddress: '',
            city: '',
            state: '',
            zip: '',
        },
    },
    products: [],
    agencyName: '',
    type: ApplicationTypeEnum.RENEWAL,
    assignedUsers: [],
    status: ApplicationStatusDisplayValueEnum.IN_PROGRESS,
    isMarketplaceApp: false,
    isBundle: false,
    totalCost: 0,
    effectiveDate: '',
    lastStatusUpdate: '',
};
