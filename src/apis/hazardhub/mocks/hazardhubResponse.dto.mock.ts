import { HazardhubResponseDto } from '../dto';
import { mockAddress } from './constants';

export const hazardhubResponseDtoMock: HazardhubResponseDto = {
    address: mockAddress.streetAddress,
    state: mockAddress.state,
    zip: mockAddress.zip,
    lat: mockAddress.lat,
    lng: mockAddress.lng,
    // eslint-disable-next-line camelcase
    location_type: mockAddress.location_type,
};

export const mockHazardhubData = {
    risks: {
        address: mockAddress.streetAddress,
        state: mockAddress.state,
        zip: mockAddress.zip,
        lat: mockAddress.lat,
        lng: mockAddress.lng,
        // eslint-disable-next-line camelcase
        location_type: mockAddress.location_type,
    },
    enchancedProperty: {},
};
