import { ApiProperty } from '@nestjs/swagger';

export class PricingDto {
    @ApiProperty({ description: 'Premium amount for the marketplace pplication', example: 100 })
    premium: number;

    @ApiProperty({ description: 'Total cost', example: 100 })
    totalCost: number;
}
