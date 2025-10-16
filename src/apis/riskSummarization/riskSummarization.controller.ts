import { AuthenticatedRequest } from '@ignidus/iscx-backend-utils';
import { Body, Controller, Param, Patch, Req } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RiskSummarizationResponseDto, UpdateRiskSummarizationRequestDto } from './dto';
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
}
