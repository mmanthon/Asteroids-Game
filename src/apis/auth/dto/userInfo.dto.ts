import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
    @ApiProperty({ description: 'User ID', example: '1' })
    id: string;

    @ApiProperty({ description: 'User Email', example: 'example@gmail.com' })
    email: string;

    @ApiProperty({ description: 'User First Name', example: 'John' })
    firstName: string;

    @ApiProperty({ description: 'User Last Name', example: 'Doe' })
    lastName: string;

    @ApiProperty({ description: 'User Phone', example: '3035555555' })
    phone: string;

    @ApiProperty({ description: 'User Agency ID', example: '130' })
    agencyID: string;

    @ApiProperty({ description: 'User Agency Name', example: 'Example' })
    agencyName: string;

    @ApiProperty({ description: 'User Parent Agency Company Name', example: 'Example' })
    parentAgencyCompanyName: string;

    @ApiProperty({ description: 'User Parent Agency ID', example: '1' })
    parentAgencyID: string;

    @ApiProperty({ description: 'User Roles' })
    roles: string[];

    @ApiProperty({ description: 'User Groups' })
    groups: string[];
}
