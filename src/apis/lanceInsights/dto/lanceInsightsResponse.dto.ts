import { ApiProperty } from '@nestjs/swagger';

import { LanceInsightProductDto } from './lanceInsightsProduct.dto';
import { LanceStatusEnum } from '../enums';

export class LanceInsightsResponseDto {
    @ApiProperty({ description: 'Application ID', example: '3044917' })
    appID: string;

    @ApiProperty({ description: 'Lance Decision Status', enum: LanceStatusEnum, example: LanceStatusEnum.PASS })
    status: LanceStatusEnum;

    @ApiProperty({ description: 'Timestamp', example: '2021-07-13T19:40:00.000Z' })
    timestamp: string;

    @ApiProperty({ description: 'Products', isArray: true, type: LanceInsightProductDto })
    products: LanceInsightProductDto[];
}
