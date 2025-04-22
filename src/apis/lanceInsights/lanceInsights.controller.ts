import { Controller, Get, Param } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LanceInsightsResponseDto } from './dto';
import { LanceInsightsService } from './lanceInsights.service';

@ApiTags('Lance Insights')
@Controller('lance-insights')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
export class LanceInsightsController {
    constructor(private readonly service: LanceInsightsService) {}

    @Get(':appID')
    @ApiOperation({ summary: 'Get Lance Insights for an application' })
    @ApiOkResponse({ type: LanceInsightsResponseDto })
    @ApiNotFoundResponse({ description: 'Application not found' })
    getLanceInsights(@Param('appID') appID: string): Promise<LanceInsightsResponseDto[]> {
        return this.service.getInsights(appID);
    }
}
