import { ApiProperty } from '@nestjs/swagger';

import { LanceInsightRuleDto } from './lanceInsightRule.dto';

export class LanceInsightRulesDto {
    @ApiProperty({
        description: 'Passing Rules',
        example: [{ label: 'Check that all drivers have no accidents', sequence: 500 }],
    })
    pass: LanceInsightRuleDto[];

    @ApiProperty({
        description: 'Failing Rules',
        example: [{ label: 'Check that all drivers have no accidents', sequence: 500 }],
    })
    fail: LanceInsightRuleDto[];
}
