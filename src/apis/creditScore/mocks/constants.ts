import { AmpRolesEnum } from '@ignidus/iscx-backend-utils';
import { BadRequestException } from '@nestjs/common';
export const actionCode1A = '1A';
export const adminRoleArrayMock = [AmpRolesEnum.DEVELOPER];
export const appID = '12345';
export const color = '#0080000';
export const drivers = [
    {
        firstName: 'Jake',
        lastName: 'Peralta',
        dob: '1980-01-01',
    },
    {
        firstName: 'Amy',
        lastName: 'Santiago',
        dob: '1980-01-01',
    },
];
export const insufficientDriverError = new BadRequestException(
    'There are not at least 2 drivers on this application. Please add more drivers to pull credit score data.',
);
export const lastOrderDate = '2024-10-01T12:00:00Z';
export const nonAdminRoleArrayMock = [AmpRolesEnum.UNDERWRITER];
export const score = 700;
export const scoreRange = '700-800';
export const status = 'Completed';
