import { IJWT } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthUtil } from './auth.util';
import { UserInfoDto, UserResponse } from './dto';

@Injectable()
export class AuthService {
    constructor(private readonly authUtil: AuthUtil, private readonly jwtService: JwtService) {}

    /**
     * @description Gets the user info for the session id and creates a jwt token
     * @param {string} sessionID
     * @returns {Promise<UserResponse>}
     */
    async findUser(sessionID: string): Promise<UserResponse> {
        const user = await this.authUtil.getUserInfo(sessionID);
        const jwtToken = await this.createJwt(user);

        return { jwtToken, user };
    }

    /**
     * @description Creates a jwt token
     * @param {UserInfoDto} user
     * @returns {Promise<string>}
     */
    private async createJwt(user: UserInfoDto): Promise<string> {
        const payload: IJWT = {
            userID: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
            groups: user.groups,
        };

        return this.jwtService.signAsync(payload);
    }
}
