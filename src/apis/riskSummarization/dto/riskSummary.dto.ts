import { ApiProperty } from '@nestjs/swagger';

export class RiskSummaryDto {
    @ApiProperty({ description: 'Risk Summary description', example: 'Summary of risk assessment' })
    description: string;

    @ApiProperty({ description: 'Preferred attributes for risk assessment', example: ['attribute1', 'attribute2'] })
    preferredAttributes: string[];

    @ApiProperty({ description: 'Standard attributes for risk assessment', example: ['attribute3', 'attribute4'] })
    standardAttributes: string[];

    @ApiProperty({ description: 'Non-standard attributes for risk assessment', example: ['attribute5', 'attribute6'] })
    nonStandardAttributes: string[];
}
