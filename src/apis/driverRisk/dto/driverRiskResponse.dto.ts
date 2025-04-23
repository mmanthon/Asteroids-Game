import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ActionDto } from './action.dto';
import { EndorsementDto } from './endorsement.dto';
import { ErrorDto } from './error.dto';
import { ViolationDto } from './violation.dto';
import { NewOrRenewalEnum } from '../enums';

export class DriverRiskResponseDto {
    @ApiProperty({ description: 'First Name', example: 'Nelly' })
    firstName: string;

    @ApiProperty({ description: 'Last Name', example: 'Donuts' })
    lastName: string;

    @ApiProperty({ description: 'Date of Birth', example: '1980-01-01' })
    dob: string;

    @ApiProperty({ description: 'License Number', example: '123456' })
    licenseNumber: string;

    @ApiProperty({ description: 'License State', example: 'CA' })
    licenseState: string;

    @ApiPropertyOptional({ description: 'License Type', example: 'Class C' })
    licenseType?: string;

    @ApiPropertyOptional({ description: 'Is Verified', example: true })
    isVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Is New Or Renewal Driver',
        enum: NewOrRenewalEnum,
        example: NewOrRenewalEnum.NEW,
    })
    isNewOrRenewalDriver?: NewOrRenewalEnum;

    @ApiPropertyOptional({ description: 'Original Date Licensed', example: '2000-01-01' })
    originalDateLicensed?: string;

    @ApiPropertyOptional({ description: 'Commercial Issue Date', example: '2000-01-01' })
    commercialIssueDate?: string;

    @ApiPropertyOptional({ description: 'License Expiration', example: '2030-01-01' })
    licenseExpiration?: string;

    @ApiPropertyOptional({ description: 'Med Status', example: 'Active' })
    medStatus?: string;

    @ApiPropertyOptional({ description: 'Total Major Count', example: 0 })
    totalMajorCount?: number;

    @ApiPropertyOptional({ description: 'Total Minor Count', example: 1 })
    totalMinorCount?: number;

    @ApiPropertyOptional({ description: 'Total Moving', example: 1 })
    totalMoving?: number;

    @ApiPropertyOptional({ description: 'Total Non Moving', example: 0 })
    totalNonMoving?: number;

    @ApiPropertyOptional({ description: 'Total Accidents', example: 0 })
    totalAccidents?: number;

    @ApiPropertyOptional({ description: 'Latest Run Date', example: '2021-01-01T00:00:00Z' })
    latestRunDate?: string;

    @ApiPropertyOptional({ description: 'Latest Call Status', example: 'Pending' })
    latestCallStatus?: string;

    @ApiPropertyOptional({ description: 'Updated', example: '2021-01-01T00:00:00Z' })
    updated?: string;

    @ApiPropertyOptional({ description: 'Look Back Start', example: '2019-01-01' })
    lookBackStart?: string;

    @ApiPropertyOptional({ description: 'Look Back End', example: '2020-01-01' })
    lookBackEnd?: string;

    @ApiPropertyOptional({ description: 'Actions', isArray: true, type: ActionDto })
    actions?: ActionDto[];

    @ApiPropertyOptional({ description: 'Violation', isArray: true, type: ViolationDto })
    violations?: ViolationDto[];

    @ApiPropertyOptional({ description: 'Error', type: ErrorDto, required: false })
    error?: ErrorDto;

    @ApiPropertyOptional({ description: 'Endorsement', type: EndorsementDto, required: false })
    endorsement?: EndorsementDto;
}
