import { AuthenticatedRequest } from '@ignidus/iscx-backend-utils';
import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreditScoreService } from './creditScore.service';
import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';
import { AppIDValidator } from '../../shared/validators';

@ApiTags('Credit Score')
@Controller('credit-score')
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
export class CreditScoreController {
    constructor(private readonly creditScoreService: CreditScoreService) {}

    @Post(':appID')
    @ApiOperation({ summary: 'Pull Credit Score for Drivers on an application' })
    @ApiCreatedResponse({ description: 'Success', type: CreditScoreResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiNotFoundResponse({ description: 'Application not found' })
    pullCreditScore(
        @Param('appID', AppIDValidator) appID: string,
        @Req() { user }: AuthenticatedRequest,
    ): Promise<CreditScoreResponseDto> {
        return this.creditScoreService.pullCreditScore(appID, user);
    }

    @Get(':appID')
    @ApiOperation({ summary: 'Get Credit Score for Drivers on an application' })
    @ApiOkResponse({ description: 'Success', type: CreditScoreResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiNotFoundResponse({ description: 'Application not found' })
    getCreditScore(
        @Param('appID', AppIDValidator) appID: string,
        @Req() { user }: AuthenticatedRequest,
    ): Promise<CreditScoreResponseDto> {
        return this.creditScoreService.getCreditScore(appID, user);
    }
}
