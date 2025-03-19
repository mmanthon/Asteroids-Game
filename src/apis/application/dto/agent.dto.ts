import { ApiProperty } from '@nestjs/swagger';

export class ApplicationAgentDto {
    @ApiProperty({ description: 'Agent ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Agent Name', example: 'John Doe' })
    name: string;
}
