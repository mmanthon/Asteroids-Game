import { Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreditScoreService } from './creditScore.service';
import { CreditScoreResponseDto } from './dto/creditScoreResponse.dto';

@ApiTags('Credit Score')
@Controller('credit-score')
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
export class CreditScoreController {
    constructor(private readonly creditScoreService: CreditScoreService) {}

    @Post(':appID')
    @ApiOperation({ summary: 'Pull Credit Score for Drivers on an application' })
    @ApiOkResponse({ description: 'Success', type: CreditScoreResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiNotFoundResponse({ description: 'Application not found' })
    pullCreditScore(@Param('appID') appID: string): Promise<CreditScoreResponseDto> {
        return this.creditScoreService.pullCreditScore(appID);
    }

    @Get(':appID')
    @ApiOperation({ summary: 'Get Credit Score for Drivers on an application' })
    @ApiOkResponse({ description: 'Success', type: CreditScoreResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiNotFoundResponse({ description: 'Application not found' })
    getCreditScore(@Param('appID') appID: string): Promise<CreditScoreResponseDto> {
        return this.creditScoreService.getCreditScore(appID);
    }
}
