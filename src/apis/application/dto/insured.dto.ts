import { AddressDto } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class InsuredDto {
    @ApiProperty({ description: 'First Name', example: 'Wilson' })
    firstName: string;

    @ApiProperty({ description: 'Last Name', example: 'Berk' })
    lastName: string;

    @ApiProperty({ description: 'Phone Number', example: '1234567890' })
    phoneNumber: string;

    @ApiProperty({ description: 'Email', example: 'test@gmail.com' })
    email: string;

    @ApiProperty({ description: 'Address', type: AddressDto })
    address: AddressDto;

    @ApiProperty({ description: 'Company Name', example: 'Company' })
    companyName: string;
}
