import { RiskSummarizationStatusEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RiskSummaryDto } from './riskSummary.dto';
import { UserFeedbackDto } from './userFeedback.dto';

export class RiskSummarizationResponseDto {
    @ApiProperty({ description: 'Risk Summarization ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Application ID', example: '654321' })
    appID: string;

    @ApiProperty({
        description: 'Risk Summarization Status',
        example: RiskSummarizationStatusEnum,
        enum: RiskSummarizationStatusEnum,
    })
    status: RiskSummarizationStatusEnum;

    @ApiPropertyOptional({ description: 'Risk Summary', type: RiskSummaryDto })
    summary?: RiskSummaryDto;

    @ApiPropertyOptional({ description: 'Machine Learning Response Timestamp', example: '2025-01-01T00:00:00Z' })
    mlResponseTimestamp?: string;

    @ApiPropertyOptional({ description: 'Failure Reason', example: 'Some error occurred' })
    failureReason?: string;

    @ApiProperty({ description: 'User Feedback', type: UserFeedbackDto, isArray: true })
    userFeedbacks: UserFeedbackDto[];

    @ApiProperty({ description: 'Created Date', example: '2025-01-01T00:00:00Z' })
    createdDate: string;
}
