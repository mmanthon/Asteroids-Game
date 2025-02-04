/* eslint-disable camelcase */
import { UserModel } from '@ignidus/iscx-backend-utils';

import { agencyID, parentAgencyID, personID, userEmail, userFirstName, userID, userLastName } from './constants.mock';

export const userModelMock: UserModel = {
    agency_id: Number(agencyID),
    email: userEmail,
    first_name: userFirstName,
    last_name: userLastName,
    parent_agency_id: Number(parentAgencyID),
    person_id: Number(personID),
    user_id: Number(userID),
    user_status_id: 1,
    user_type_id: 1,
};
