/* eslint-disable camelcase */

import { UserModel } from '@ignidus/iscx-backend-utils';

import { agencyID, parentAgencyID, personID, userEmail, userFirstName, userID, userLastName } from './constants.mock';

export const mockEmptyUserModel: UserModel = {
    agency_id: 0,
    email: '',
    first_name: null,
    last_name: null,
    parent_agency_id: 0,
    person_id: 0,
    user_id: 0,
    user_status_id: 0,
    user_type_id: 0,
};
export const mockUserModel: UserModel = {
    agency_id: agencyID,
    email: userEmail,
    first_name: userFirstName,
    last_name: userLastName,
    parent_agency_id: parentAgencyID,
    person_id: personID,
    user_id: userID,
    user_status_id: 1,
    user_type_id: 1,
};
