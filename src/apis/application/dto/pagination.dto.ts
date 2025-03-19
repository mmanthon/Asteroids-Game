import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
    @ApiProperty({ description: 'Total Pages', example: 10 })
    totalPages: number;

    @ApiProperty({ description: 'Current Page', example: 1 })
    currentPage: number;

    @ApiProperty({ description: 'Next Page', type: 'number', nullable: true, example: 2 })
    nextPage: number | null;
}
