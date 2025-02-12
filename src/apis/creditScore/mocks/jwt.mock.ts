import { AmpRolesEnum, IJWT } from '@ignidus/iscx-backend-utils';

export const mockJWT: IJWT = {
    userID: 'user123',
    firstName: 'Uwie',
    lastName: 'Dev',
    groups: [],
    roles: [AmpRolesEnum.DEVELOPER],
};
