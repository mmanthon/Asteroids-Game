import { HazardhubResponseDto } from '../dto';
import { lat, lng, locationType, mockAddress } from './constants';

export const hazardhubResponseDtoMock: HazardhubResponseDto = {
    address: mockAddress.streetAddress,
    state: mockAddress.state,
    zip: mockAddress.zip,
    lat,
    lng,
    // eslint-disable-next-line camelcase
    location_type: locationType,
};

export const mockHazardhubData = {
    risks: {
        address: mockAddress.streetAddress,
        state: mockAddress.state,
        zip: mockAddress.zip,
        lat,
        lng,
        // eslint-disable-next-line camelcase
        location_type: locationType,
    },
    enchancedProperty: {},
};
