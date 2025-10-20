import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UserFeedbackDto {
    @ApiProperty({ description: 'Indicates if the feedback is helpful', example: true })
    @IsBoolean()
    isHelpful: boolean;

    @ApiPropertyOptional({
        description: 'Categories when not helpful',
        example: ['Missing information', 'Outdated information'],
        type: String,
        isArray: true,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories?: string[];

    @ApiPropertyOptional({
        description: 'Additional details about the feedback',
        example: 'The feature crashes when I try to use it',
    })
    @IsOptional()
    @IsString()
    additionalDetail?: string;
}
