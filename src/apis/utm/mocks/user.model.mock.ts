/* eslint-disable camelcase */
import { UserModel } from '@ignidus/iscx-backend-utils';

import { mockAgencyID, mockUserEmail, mockUserFname, mockUserID, mockUserLname } from './constants.mock';

export const mockAmpModelUser: UserModel = {
    user_id: Number(mockUserID),
    first_name: mockUserFname,
    last_name: mockUserLname,
    email: mockUserEmail,
    agency_id: Number(mockAgencyID),
    parent_agency_id: 0,
    person_id: 0,
    user_status_id: 0,
    user_type_id: 0,
};
