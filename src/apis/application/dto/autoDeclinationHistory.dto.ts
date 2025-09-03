/* eslint-disable sort-exports/sort-exports */
import { FailedAutoDeclineRuleDto } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class FailedRuleDto extends FailedAutoDeclineRuleDto {
    @ApiProperty({
        description: 'The application section that the rule failed (only for application answer rules)',
        example: 'Personal Information',
    })
    section: string;
}

export class AutoDeclinationHistoryDto {
    @ApiProperty({ description: 'Auto Declination Date', example: '2021-01-01' })
    timestamp: string;

    @ApiProperty({ description: 'Auto Declination Rules', type: FailedRuleDto, isArray: true })
    rules: FailedRuleDto[];
}
