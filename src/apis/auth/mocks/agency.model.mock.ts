/* eslint-disable camelcase */
import { AgencyModel } from '@ignidus/iscx-backend-utils';

import { agencyID, companyID, parentAgencyID } from './constants.mock';

export const agencyModelMock: AgencyModel = {
    agency_id: Number(agencyID),
    company_id: Number(companyID),
    parent_agency_id: Number(parentAgencyID),
};
