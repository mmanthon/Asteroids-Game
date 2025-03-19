/* eslint-disable camelcase */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumberString, IsOptional } from 'class-validator';

export class UpdateApplicationRequestDto {
    @ApiPropertyOptional({ description: 'Underwriter User ID', example: ['4354'], isArray: true, type: String })
    @IsOptional()
    @IsArray()
    @Type(() => String)
    @IsNumberString({ no_symbols: true }, { each: true })
    underwriterUserIDs?: string[];

    @ApiPropertyOptional({ description: 'Agent ID', example: '123456' })
    @IsOptional()
    @IsNumberString({ no_symbols: true })
    agentID?: string;
}
