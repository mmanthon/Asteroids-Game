import { AuthenticatedRequest, IJWT } from '@ignidus/iscx-backend-utils';

export const mockUser: IJWT = {
    userID: '1234561',
    firstName: 'Test',
    lastName: 'User',
    roles: [],
    groups: [],
};

export const mockUserRequest = { user: mockUser } as AuthenticatedRequest;
