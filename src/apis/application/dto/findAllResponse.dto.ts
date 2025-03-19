import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { PaginationDto } from './pagination.dto';

import { ApplicationDto } from './index';

export class FindAllResponseDto {
    @ApiProperty({ description: 'Applications', type: ApplicationDto, isArray: true })
    @Type(() => ApplicationDto)
    applications: ApplicationDto[];

    @ApiProperty({ description: 'Pagination', type: PaginationDto })
    @Type(() => PaginationDto)
    pagination: PaginationDto;
}
