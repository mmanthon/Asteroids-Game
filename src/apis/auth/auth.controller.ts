import { Public } from '@ignidus/iscx-backend-utils';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { UserResponse } from './dto';
import { SessionIDGuard } from '../../shared/guards';

@ApiTags('Auth')
@Controller('auth')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/user')
    @Public() // Bypass JWT authentication which is not needed for this endpoint
    @UseGuards(SessionIDGuard) // Use the SessionIDGuard to check if the user has a valid sessionID
    @ApiOperation({ summary: 'Get a signed token and user info for the amp sessionID' })
    @ApiOkResponse({
        description: 'Session validated and user info returned',
        type: UserResponse,
    })
    @ApiUnauthorizedResponse({ description: 'Session is invalid' })
    async findUser(@Req() request): Promise<UserResponse> {
        const { sessionID } = request;

        return await this.authService.findUser(sessionID);
    }
}
