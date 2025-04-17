import { mockAddressDto } from './address.dto.mock';
import { InsuredDto } from '../dto/insured.dto';

export const mockInsuredDto: InsuredDto = {
    firstName: 'Wilson',
    lastName: 'Berk',
    phoneNumber: '1234567890',
    email: 'test@gmail.com',
    address: mockAddressDto,
    companyName: 'Company',
};
