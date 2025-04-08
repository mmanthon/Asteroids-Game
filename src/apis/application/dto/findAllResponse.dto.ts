import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { PaginationDto } from './pagination.dto';
import { SimplifiedApplicationDto } from './simplifiedApplication.dto';

export class FindAllResponseDto {
    @ApiProperty({ description: 'Applications', type: SimplifiedApplicationDto, isArray: true })
    @Type(() => SimplifiedApplicationDto)
    applications: SimplifiedApplicationDto[];

    @ApiProperty({ description: 'Pagination', type: PaginationDto })
    @Type(() => PaginationDto)
    pagination: PaginationDto;
}
