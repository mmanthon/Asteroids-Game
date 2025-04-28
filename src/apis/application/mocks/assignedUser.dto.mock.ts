import { AssignedUserDto } from '../dto';
import { userFirstName, userID, userLastName } from './constants.mock';

export const mockAssignedUserDto: AssignedUserDto = {
    id: String(userID),
    firstName: userFirstName,
    lastName: userLastName,
};
