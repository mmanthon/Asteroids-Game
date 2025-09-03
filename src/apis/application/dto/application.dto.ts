import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

import { AgentDto } from './agent.dto';
import { AssignedUserDto } from './assignedUser.dto';
import { AutoDeclinationHistoryDto } from './autoDeclinationHistory.dto';
import { ClaimDto } from './claim.dto';
import { EmailDto } from './email.dto';
import { InsuredDto } from './insured.dto';
import { NoteDto } from './note.dto';
import { PricingDto } from './pricing.dto';
import { ApplicationProductDto } from './product.dto';

export class ApplicationDto {
    @ApiProperty({ description: 'Application ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Submission ID', example: '123456' })
    submissionID: string;

    @ApiProperty({ description: 'Insured', type: InsuredDto })
    insured: InsuredDto;

    @ApiProperty({ description: 'Product', type: ApplicationProductDto, isArray: true })
    products: ApplicationProductDto[];

    @ApiProperty({ description: 'Agency', example: 'ISC' })
    agencyName: string;

    @ApiProperty({ description: 'Agent', type: AgentDto })
    agent: AgentDto;

    @ApiProperty({ description: 'Type', enum: ApplicationTypeEnum })
    type: ApplicationTypeEnum;

    @ApiProperty({ description: 'Assigned Users', type: AssignedUserDto, isArray: true })
    assignedUsers: AssignedUserDto[];

    @ApiProperty({ description: 'Application Status', enum: ApplicationStatusDisplayValueEnum })
    status: ApplicationStatusDisplayValueEnum;

    @ApiProperty({ description: 'Is Marketplace App', example: true })
    isMarketplaceApp: boolean;

    @ApiProperty({ description: 'Is Bundled App', example: true })
    isBundle: boolean;

    @ApiProperty({ description: 'Total Cost', example: 1000, deprecated: true })
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

    @ApiProperty({ description: 'Claims', type: ClaimDto, isArray: true })
    claims: ClaimDto[];

    @ApiProperty({ description: 'List of emails tied to the application', type: EmailDto, isArray: true })
    emails: EmailDto[];

    @ApiProperty({ description: 'Notes', type: NoteDto, isArray: true })
    notes: NoteDto[];

    @ApiProperty({ description: 'Pricing breakdown for a marketplace application', type: PricingDto })
    pricing: PricingDto;

    @ApiProperty({
        description: 'Auto Declination History',
        type: AutoDeclinationHistoryDto,
        isArray: true,
    })
    autoDeclinationHistory: AutoDeclinationHistoryDto[];

    @ApiProperty({ description: 'Created Date', example: '2021-01-01' })
    createdDate: string;
}
