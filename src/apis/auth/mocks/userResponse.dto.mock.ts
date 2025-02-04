import { UserResponse } from '../dto';
import { jwt } from './constants.mock';
import { userInfoDtoMock } from './userInfo.dto.mock';

export const userResponseDtoMock: UserResponse = {
    user: userInfoDtoMock,
    jwtToken: jwt,
};
