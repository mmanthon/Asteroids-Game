import { ApiProperty } from '@nestjs/swagger';

export class LanceInsightRuleDto {
    @ApiProperty({ description: 'Rule Label', example: 'Check that all drivers have no accidents' })
    label: string;

    @ApiProperty({ description: 'Rule Sequence', example: 500 })
    sequence: number;
}
