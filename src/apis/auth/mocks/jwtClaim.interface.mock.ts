import { IJWT } from '@ignidus/iscx-backend-utils';

import { userFirstName, userID, userLastName, userRoles } from './constants.mock';

export const jwtClaimMock: IJWT = {
    userID: userID,
    roles: userRoles,
    firstName: userFirstName,
    lastName: userLastName,
    groups: [],
};
