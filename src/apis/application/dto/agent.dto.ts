import { ApiProperty } from '@nestjs/swagger';

export class AgentDto {
    @ApiProperty({ description: 'Agent ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Agent Name', example: 'John Doe' })
    name: string;
}
