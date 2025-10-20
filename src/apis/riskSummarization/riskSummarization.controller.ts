import { AuthenticatedRequest } from '@ignidus/iscx-backend-utils';
import { Body, Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { FilterParamsDto, RiskSummarizationResponseDto, UpdateRiskSummarizationRequestDto } from './dto';
import { RiskSummarizationService } from './riskSummarization.service';

@ApiTags('Risk Summarizations')
@Controller('risk-summarizations')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
export class RiskSummarizationController {
    constructor(private readonly service: RiskSummarizationService) {}

    @Patch(':id')
    @ApiOperation({ summary: 'Update Risk Summarization' })
    @ApiOkResponse({ description: 'Risk Summarization updated', type: RiskSummarizationResponseDto })
    @ApiNotFoundResponse({ description: 'Not found' })
    update(
        @Param('id') id: string,
        @Body() body: UpdateRiskSummarizationRequestDto,
        @Req() { user }: AuthenticatedRequest,
    ): Promise<RiskSummarizationResponseDto> {
        return this.service.update(id, body, user);
    }

    @Get()
    @ApiOperation({ summary: 'List Risk Summarizations' })
    @ApiOkResponse({ type: RiskSummarizationResponseDto, isArray: true, description: 'List of Risk Summarizations' })
    async findAll(@Query() filters: FilterParamsDto): Promise<RiskSummarizationResponseDto[]> {
        return this.service.findAll(filters);
    }
}
