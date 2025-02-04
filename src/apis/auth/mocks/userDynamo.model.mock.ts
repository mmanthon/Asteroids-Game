import { UserDynamoModel } from '@ignidus/iscx-backend-utils';

import { createdDate, updatedDate, userEmail, userFirstName, userID, userLastName, userRoles } from './constants.mock';

export const userDynamoModelMock: UserDynamoModel = {
    id: userID,
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
    identifier: userID,
    roles: userRoles,
    groups: [],
    attributes: {},
    updatedBy: userID,
    updatedDate,
    createdDate,
};
