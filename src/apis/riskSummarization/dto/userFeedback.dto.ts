import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class UserFeedbackDto {
    @ApiProperty({ description: 'Indicates if the feedback is helpful', example: true })
    @IsBoolean()
    isHelpful: boolean;

    @ApiProperty({
        description: 'Categories when not helpful',
        example: 'The feature is not working as expected',
        isArray: true,
    })
    @IsArray()
    @IsString({ each: true })
    categories: string[];

    @ApiProperty({
        description: 'Additional details about the feedback',
        example: 'The feature crashes when I try to use it',
    })
    @IsString()
    additionalDetail?: string;
}
