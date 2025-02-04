import { UserInfoDto } from '../dto';
import {
    agencyID,
    agencyName,
    parentAgencyCompanyName,
    userEmail,
    userFirstName,
    userID,
    userLastName,
    userPhone,
    userRoles,
} from './constants.mock';

export const userInfoDtoMock: UserInfoDto = {
    id: userID,
    email: userEmail,
    firstName: userFirstName,
    lastName: userLastName,
    phone: userPhone,
    roles: userRoles,
    groups: [],
    parentAgencyCompanyName: parentAgencyCompanyName,
    parentAgencyID: agencyID,
    agencyName: agencyName,
    agencyID: agencyID,
};
