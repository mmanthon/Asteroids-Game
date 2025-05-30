import { AmpRolesEnum, IJWT } from '@ignidus/iscx-backend-utils';

export const authHeader = 'Bearer mockSessionID';
export const mockRequiredRoles: AmpRolesEnum[] = [AmpRolesEnum.ATM_ADMIN];
export const mockUser: IJWT = {
    userID: '123',
    firstName: 'John',
    lastName: 'Doe',
    roles: [AmpRolesEnum.ATM_ADMIN, AmpRolesEnum.UNDERWRITER],
    groups: ['group-1'],
};
export const mockUserNoAccess: IJWT = {
    ...mockUser,
    roles: [AmpRolesEnum.UNDERWRITER],
};
export const sessionID = 'mockSessionID';
