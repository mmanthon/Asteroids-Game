import { ApiProperty } from '@nestjs/swagger';

export class AssignedUserDto {
    @ApiProperty({ description: 'User ID', example: '123456' })
    id: string;

    @ApiProperty({ description: 'First Name', example: 'John' })
    firstName: string;

    @ApiProperty({ description: 'Last Name', example: 'Doe' })
    lastName: string;
}
