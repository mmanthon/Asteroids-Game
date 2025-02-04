import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { UserInfoDto } from './userInfo.dto';

export class UserResponse {
    @ApiProperty({ description: 'The User Info' })
    user: UserInfoDto;

    @ApiProperty({ description: 'The JWT Token' })
    @IsString()
    jwtToken: string;
}
