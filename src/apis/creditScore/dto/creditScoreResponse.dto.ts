// disable auto sort exports alphabetically
/* eslint-disable sort-exports/sort-exports */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverDto {
    @ApiProperty({ description: 'Driver First Name', example: 'John' })
    firstName: string;

    @ApiProperty({ description: 'Driver Last Name', example: 'Doe' })
    lastName: string;

    @ApiProperty({ description: 'Driver License State', example: 'CA' })
    licenseState: string;

    @ApiProperty({ description: 'Driver Date of Birth', example: '1980-01-01', format: 'date' })
    dob: string;

    @ApiProperty({ description: 'Driver License Number', example: 'D1234567' })
    licenseNum: string;
}

export class CreditScoreResponseDto {
    @ApiProperty({ description: 'Status of the credit score request', example: 'success' })
    status: string;

    @ApiProperty({ description: 'Application ID', example: '12345' })
    appID: string;

    // Will only return a value for the admin role
    @ApiPropertyOptional({ description: 'Credit Score', example: 700 })
    score?: number;

    // Will only return a value for the admin role
    @ApiPropertyOptional({ description: 'Credit Score Range', example: '700-800' })
    scoreRange?: string;

    @ApiProperty({ description: 'Action Code', example: '1A' })
    actionCode: string;

    @ApiProperty({ description: 'Last Order Date', example: '2023-10-01T12:00:00Z', format: 'date-time' })
    lastOrderDate: string;

    @ApiProperty({ description: 'Drivers associated with the credit score', type: DriverDto, isArray: true })
    drivers: DriverDto[];
}
