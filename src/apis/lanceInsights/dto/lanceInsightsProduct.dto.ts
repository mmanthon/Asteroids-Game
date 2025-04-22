import { ApiProperty } from '@nestjs/swagger';

import { LanceInsightRulesDto } from './lanceInsightsRules.dto';
import { LanceStatusEnum } from '../enums';

export class LanceInsightProductDto {
    @ApiProperty({ description: 'Product ID', example: '83' })
    productID: string;

    @ApiProperty({ description: 'Lance Decision', enum: LanceStatusEnum })
    status: LanceStatusEnum;

    @ApiProperty({ description: 'Carrier Name', example: 'Trinity' })
    carrierName: string;

    @ApiProperty({ description: 'Rule Results', type: LanceInsightRulesDto, isArray: true })
    rules: LanceInsightRulesDto;
}
