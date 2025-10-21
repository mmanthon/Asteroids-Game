/* eslint-disable camelcase */
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
        example: RiskSummarizationStatusEnum.IN_PROGRESS,
        enum: RiskSummarizationStatusEnum,
    })
    status: RiskSummarizationStatusEnum;

    @ApiPropertyOptional({ description: 'Risk Summary', type: RiskSummaryDto })
    summary?: RiskSummaryDto;

    @ApiPropertyOptional({ description: 'Machine Learning Response Timestamp', example: '2025-01-01T00:00:00Z' })
    mlResponseTimestamp?: string;

    @ApiPropertyOptional({
        description: 'Machine Learning Request',
        type: Object,
        example: {
            company_info: {
                company_name: 'test company name',
                insured_first_name: 'test first name',
                insured_last_name: 'test last name',
                physical_address: {
                    street_address: 'test street address',
                    apt_suite: 'test apt suite',
                    city: 'test city',
                    state: 'test state',
                    zip: 'test zip',
                    country: 'test country',
                },
            },
            application_answers: {
                ins_eff_date: ' 2025-01-01',
            },
        },
    })
    mlRequest?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Failure Reason', example: 'Some error occurred' })
    failureReason?: string;

    @ApiProperty({ description: 'User Feedback', type: UserFeedbackDto, isArray: true })
    userFeedbacks: UserFeedbackDto[];

    @ApiProperty({ description: 'Created Date', example: '2025-01-01T00:00:00Z' })
    createdDate: string;
}
