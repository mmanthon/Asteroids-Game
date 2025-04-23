import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActionDto {
    @ApiPropertyOptional({ description: 'Code', example: 'SUSP' })
    code?: string;

    @ApiPropertyOptional({ description: 'Type', example: 'VIOL' })
    type?: string;

    @ApiPropertyOptional({ description: 'Source', example: 'MVR-07963' })
    source?: string;

    @ApiPropertyOptional({ description: 'Mail Date', example: '2022-05-03' })
    mailDate?: string;

    @ApiPropertyOptional({ description: 'Thru Date', example: '2022-05-03' })
    thruDate?: string;

    @ApiPropertyOptional({ description: 'Thru Status', example: 'INDEF' })
    thruStatus?: string;

    @ApiPropertyOptional({ description: 'Start Date', example: '05/06/2024' })
    startDate?: string;

    @ApiPropertyOptional({ description: 'End Date', example: '05/06/2024' })
    endDate?: string;

    @ApiPropertyOptional({ description: 'Incident Date', example: '2018-08-06' })
    incidentDate?: string;

    @ApiPropertyOptional({ description: 'Ordered Date', example: '2018-08-06' })
    orderedDate?: string;

    @ApiPropertyOptional({ description: 'Commercial', example: true })
    commercial?: boolean;

    @ApiPropertyOptional({ description: 'Actual End Date', example: '2022-05-03' })
    actualEndDate?: string;

    @ApiPropertyOptional({ description: 'Message', example: 'ADD TO RECORD DATE: 4/26/2022' })
    message?: string;
}
