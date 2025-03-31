/* eslint-disable camelcase */
import { ApiProperty } from '@nestjs/swagger';

export class HazardhubResponseDto {
    @ApiProperty({ description: 'The location address', type: String, example: '123 Main St' })
    address: string;

    @ApiProperty({ description: 'The location state', type: String, example: 'TX' })
    state: string;

    @ApiProperty({ description: 'The location zip', type: String, example: '75201' })
    zip: string;

    @ApiProperty({ description: 'The location type', type: String, example: 'ADDRESS' })
    location_type: string;

    @ApiProperty({ description: 'Location Latitude', type: Number, example: 33.021 })
    lat: number;

    @ApiProperty({ description: 'Location Longitude', type: Number, example: -96.698 })
    lng: number;

    // There are over 100 additional properties that could be returned from calling hazardhub API. We are only showing a few here.
    // For a full list of properties, please refer to Hazardhub data Dictionary at the root of the hazardhub directory.
    // Dictionary file: experian_hazardhub_data_dictionary.pdf
}
