import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { InsuredDto } from './insured.dto';

import { ApplicationAgentDto, ApplicationProductDto, AssignedUserDto, ClaimDto } from './index';

export class ApplicationDto {
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

    @ApiProperty({ description: 'Agent', type: ApplicationAgentDto })
    @Type(() => ApplicationAgentDto)
    agent: ApplicationAgentDto;

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

    @ApiProperty({ description: 'Total Cost', example: 1000 })
    totalCost: number;

    @ApiProperty({ description: 'Policy Number', example: 'AE123456' })
    policyNumber: string;

    @ApiProperty({ description: 'Effective Date', example: '2021-01-01' })
    effectiveDate: string;

    @ApiProperty({ description: 'Expiration Date', example: '2021-01-01' })
    expirationDate: string;

    @ApiProperty({ description: 'Bound Date', example: '2021-01-01' })
    boundDate: string;

    @ApiProperty({ description: 'Date updated', example: '2021-01-01' })
    updatedDate: string;

    @ApiProperty({ description: 'Last status updated date', example: '2021-01-01' })
    lastStatusUpdate: string;

    @ApiProperty({ description: 'Claims', type: ClaimDto, isArray: true, example: [] })
    claims: ClaimDto[];

    @ApiProperty({ description: 'Created Date', example: '2021-01-01' })
    createdDate: string;
}
