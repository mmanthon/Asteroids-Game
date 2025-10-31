import { AmpEmailActionTypeEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTaskRequestDto {
    @ApiProperty({
        description: 'ID of the email sent from amp.',
        example: '54432',
        type: String,
    })
    @IsString()
    emailID: string;

    @ApiProperty({
        description: 'Action type of the email sent from amp.',
        example: AmpEmailActionTypeEnum.APPROVAL_REQUESTED,
        enum: AmpEmailActionTypeEnum,
    })
    @IsString() // TODO: add enum validation
    actionType: AmpEmailActionTypeEnum;
}
