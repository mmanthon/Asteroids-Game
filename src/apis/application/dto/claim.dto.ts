import { ClaimStatusEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimDto {
    @ApiProperty({ description: 'Claim ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'JDI ID', example: '123456' })
    jdiID: string;

    @ApiProperty({ description: 'Application ID', example: '123456' })
    appID: string;

    @ApiProperty({ description: 'Claim Status', enum: ClaimStatusEnum })
    status: ClaimStatusEnum;

    @ApiProperty({ description: 'Requested Amount', example: 1000 })
    requestedAmount: number;

    @ApiProperty({ description: 'Updated Date', example: '2021-01-01' })
    updatedDate: string;

    @ApiProperty({ description: 'Created Date', example: '2021-01-01' })
    createdDate: string;

    @ApiProperty({ description: 'Paid Out Date', example: '2021-01-01' })
    paidOutDate?: string;
}
