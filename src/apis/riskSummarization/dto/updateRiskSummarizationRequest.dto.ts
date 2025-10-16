import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

import { UserFeedbackDto } from './userFeedback.dto';

export class UpdateRiskSummarizationRequestDto {
    @ApiPropertyOptional({ description: 'User Feedback', type: () => UserFeedbackDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UserFeedbackDto)
    userFeedback?: UserFeedbackDto;
}
