import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterParamsDto {
    @ApiPropertyOptional({ description: 'Application ID to filter by', example: 'app123' })
    @IsOptional()
    @IsString()
    appID?: string;
}
