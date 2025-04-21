import { ApiProperty } from '@nestjs/swagger';

export class AgentDto {
    @ApiProperty({ description: 'Agent ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Agent first name', example: 'John' })
    firstName: string;

    @ApiProperty({ description: 'Agent last name', example: 'Due' })
    lastName: string;

    @ApiProperty({ description: 'Agent email', example: 'john.doe@gmail.com' })
    email: string;

    @ApiProperty({ description: 'Agent phone number', example: '1234567890' })
    phone: string;
}
