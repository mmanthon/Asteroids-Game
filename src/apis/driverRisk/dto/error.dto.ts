import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
    @ApiProperty({ description: 'Code', example: 'Error Code 454' })
    code: string;

    @ApiProperty({ description: 'Message', example: 'Error Message' })
    message: string;
}
