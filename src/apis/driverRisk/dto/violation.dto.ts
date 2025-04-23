import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ViolationDto {
    @ApiProperty({ description: 'Violation Date', example: '2021-01-01' })
    violationDate: string;

    @ApiProperty({ description: 'Violation Type', example: 'Speeding' })
    violationType: string;

    @ApiProperty({ description: 'Violation Description', example: 'Exceeding speed limit' })
    violationDescription: string;

    @ApiProperty({ description: 'Incident Source', example: 'Police' })
    incidentSource: string;

    @ApiProperty({ description: 'Run Date', example: '2021-01-01T00:00:00Z' })
    runDate: string;

    @ApiPropertyOptional({ description: 'Vehicle Type', example: 'Car' })
    vehicleType?: string;

    @ApiPropertyOptional({ description: 'Severity', example: 'Major' })
    severity?: string;

    @ApiPropertyOptional({ description: 'Adjudication Date', example: '2021-02-01' })
    adjudicationDate?: string;

    @ApiPropertyOptional({ description: 'Adjudication Description', example: 'Fine paid' })
    adjudicationDescription?: string;

    @ApiPropertyOptional({ description: 'Disposition Of Violation', example: 'Resolved' })
    dispositionOfViolation?: string;

    @ApiPropertyOptional({ description: 'Location Of Violation', example: 'California' })
    locationOfViolation?: string;

    @ApiPropertyOptional({ description: 'EVC Code', example: '123' })
    evcCode?: string;

    @ApiPropertyOptional({ description: 'Is Moving Violation', example: true })
    isMovingViolation?: boolean;

    @ApiPropertyOptional({ description: 'Is Action Restricted', example: true })
    isActionRestricted?: boolean;
}
