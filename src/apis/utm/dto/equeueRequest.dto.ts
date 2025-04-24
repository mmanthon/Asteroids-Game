import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EnqueueRequestDto {
    @ApiProperty({
        description: 'ID of the email sent from amp.',
        example: '54432',
        type: String,
    })
    @IsString()
    emailID: string;

    @ApiProperty({
        description: 'Action type of the email sent from amp.',
        example: 'approval',
        type: String,
    })
    @IsString()
    actionType: string;
}
