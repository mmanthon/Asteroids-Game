import { EndorsementStatusDisplayValueEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EndorsementDto {
    @ApiProperty({ description: 'id', example: '250608' })
    id: string;

    @ApiProperty({ description: 'createdDate', example: '2021-01-01T00:00:00Z' })
    createdDate: string;

    @ApiProperty({
        description: 'status',
        example: EndorsementStatusDisplayValueEnum.APPROVAL_REQUESTED,
        enum: EndorsementStatusDisplayValueEnum,
    })
    status: EndorsementStatusDisplayValueEnum;

    @ApiPropertyOptional({ description: 'boundDate', example: '2021-01-01T00:00:00Z' })
    boundDate?: string;
}
