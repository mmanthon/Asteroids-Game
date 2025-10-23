import { ApiProperty } from '@nestjs/swagger';

export class ApplicationProductDto {
    @ApiProperty({ description: 'Product ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Product Name', example: 'Product' })
    name: string;

    @ApiProperty({ description: 'Program ID', example: '123456' })
    programID: string;

    @ApiProperty({ description: 'Program Type ID', example: '3456' })
    programTypeID: string;

    @ApiProperty({ description: 'Is Direct To Consumer', example: true })
    isDirectToConsumer: boolean;

    @ApiProperty({ description: 'Carrier Name', example: 'Carrier' })
    carrierName: string;

    @ApiProperty({ description: 'Is Auto Risk Summarization Enabled', example: true })
    isAutoRiskSummarizationEnabled: boolean;
}
