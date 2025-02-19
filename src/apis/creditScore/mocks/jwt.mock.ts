// disable auto sort exports alphabetically
/* eslint-disable sort-exports/sort-exports */
import { AmpRolesEnum, IJWT } from '@ignidus/iscx-backend-utils';

export const jwtMock: IJWT = {
    userID: 'user123',
    firstName: 'Uwie',
    lastName: 'Dev',
    groups: [],
    roles: [AmpRolesEnum.UNDERWRITER],
};

export const adminJwtMock: IJWT = {
    ...jwtMock,
    roles: [AmpRolesEnum.DEVELOPER],
};
