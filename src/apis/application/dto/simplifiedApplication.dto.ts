import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { AssignedUserDto } from './assignedUser.dto';
import { InsuredDto } from './insured.dto';
import { PricingDto } from './pricing.dto';
import { ApplicationProductDto } from './product.dto';

export class SimplifiedApplicationDto {
    @ApiProperty({ description: 'Application ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Submission ID', example: '123456' })
    submissionID: string;

    @ApiProperty({ description: 'Insured', type: InsuredDto })
    @Type(() => InsuredDto)
    insured: InsuredDto;

    @ApiProperty({ description: 'Product', type: ApplicationProductDto, isArray: true, example: [] })
    @Type(() => ApplicationProductDto)
    products: ApplicationProductDto[];

    @ApiProperty({ description: 'Agency', example: 'ISC' })
    agencyName: string;

    @ApiProperty({ description: 'Type', enum: ApplicationTypeEnum })
    type: ApplicationTypeEnum;

    @ApiProperty({ description: 'Assigned Users', type: AssignedUserDto, isArray: true, example: [] })
    @Type(() => AssignedUserDto)
    assignedUsers: AssignedUserDto[];

    @ApiProperty({ description: 'Application Status', enum: ApplicationStatusDisplayValueEnum })
    status: ApplicationStatusDisplayValueEnum;

    @ApiProperty({ description: 'Is Marketplace App', example: true })
    isMarketplaceApp: boolean;

    @ApiProperty({ description: 'Is Bundled App', example: true })
    isBundle: boolean;

    @ApiProperty({ description: 'Total Cost', example: 1000, deprecated: true })
    totalCost: number;

    @ApiProperty({ description: 'Effective Date', example: '2021-01-01' })
    effectiveDate: string;

    @ApiProperty({ description: 'Expiration Date', example: '2021-01-01' })
    expirationDate: string;

    @ApiProperty({ description: 'Policy Number', example: 'AE123456' })
    boundDate: string;

    @ApiProperty({ description: 'Last status updated date', example: '2021-01-01' })
    lastStatusUpdate: string;

    @ApiProperty({ description: 'Pricing breakdown for a marketplace application', type: PricingDto, example: [] })
    pricing: PricingDto;
}
