import { Controller, Get, Param } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { HazardhubService } from './hazardhub.service';
import { AppIDValidator } from '../../shared/validators';

@Controller('hazardhub')
@ApiTags('Hazardhub')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
export class HazardhubController {
    constructor(private readonly hazardhubService: HazardhubService) {}

    @Get(':appID')
    @ApiOperation({ summary: 'Get application hazardhub data' })
    @ApiOkResponse({ description: 'Return all hazardhub data', isArray: true })
    @ApiNotFoundResponse({ description: 'No hazardhub data found' })
    findOne(@Param('appID', AppIDValidator) appID: string) {
        return this.hazardhubService.findOne(appID);
    }
}
