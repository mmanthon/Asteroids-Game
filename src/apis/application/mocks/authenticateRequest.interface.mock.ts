import { AuthenticatedRequest, IJWT } from '@ignidus/iscx-backend-utils';

import { userFirstName, userID, userLastName } from './constants.mock';

export const mockUser: IJWT = {
    userID: String(userID),
    firstName: userFirstName,
    lastName: userLastName,
    roles: [],
    groups: [],
};

export const mockUserRequest = { user: mockUser } as AuthenticatedRequest;
