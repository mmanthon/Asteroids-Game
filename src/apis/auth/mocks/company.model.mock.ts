/* eslint-disable camelcase */
import { CompanyModel } from '@ignidus/iscx-backend-utils';

import { agencyName, companyID } from './constants.mock';

export const companyModelMock: CompanyModel = {
    name: agencyName,
    company_id: Number(companyID),
    email: 'company@example.com',
};
