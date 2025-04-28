import { mockAddressDto } from './address.dto.mock';
import { InsuredDto } from '../dto/insured.dto';

export const emptyInsuredDto: InsuredDto = {
    firstName: '',
    lastName: '',
    companyName: '',
    phoneNumber: '',
    email: '',
    address: {
        streetAddress: '',
        city: '',
        state: '',
        zip: '',
    },
};

export const mockInsuredDto: InsuredDto = {
    firstName: 'Wilson',
    lastName: 'Berk',
    phoneNumber: '1234567890',
    email: 'test@gmail.com',
    address: mockAddressDto,
    companyName: 'Company',
};
