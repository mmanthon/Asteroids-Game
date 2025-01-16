import { AddressDto } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class HazardHubUtil {
    constructor(@Inject('Amp') private readonly ampDB: Knex) {}

    /**
     * @description Validate address object
     * @param {AddressDto} address
     * @returns {boolean}
     * @throws {BadRequestException} if any required field is missing or empty
     */
    validateAddress(address: AddressDto): boolean {
        const missingFields: string[] = [];

        if (!address.streetAddress?.trim()) missingFields.push('streetAddress');
        if (!address.city?.trim()) missingFields.push('city');
        if (!address.state?.trim()) missingFields.push('state');
        if (!address.zip?.trim()) missingFields.push('zip');

        if (missingFields.length > 0) {
            throw new BadRequestException(`Missing or empty required address fields: ${missingFields.join(', ')}`);
        }

        return true;
    }
}
