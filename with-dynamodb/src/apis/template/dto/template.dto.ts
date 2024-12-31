import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * This is an example of a DTO class
 * Remove or edit this file as needed.
 * */
export class TemplateDto {
    @ApiProperty({ description: 'The first name of the person', example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;
}
