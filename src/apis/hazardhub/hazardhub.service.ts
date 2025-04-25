/* eslint-disable camelcase */
import { AddressDto } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { HazardhubResponseDto } from './dto';
import { HazardHubQuery } from './hazardhub.query';
import { HazardHubUtil } from './hazardhub.util';
import { AmpApiIntegration } from '../../shared/external';

@Injectable()
export class HazardhubService {
    constructor(
        private readonly hazardhubUtil: HazardHubUtil,
        private readonly hazardhubQuery: HazardHubQuery,
        private readonly ampApiIntegration: AmpApiIntegration,
    ) {}

    /**
     * @description Get hazardhub data for a specific application
     * @param {string} appID
     * @returns {Promise<HazardhubResponseDto[]>}
     */
    async findOne(appID: string): Promise<HazardhubResponseDto[]> {
        // TODO: In the future, we will add logic to handle multiple addresses
        const allowedProducts = ['93', '128'];

        const application = await this.hazardhubQuery.getApplication(appID);

        if (!allowedProducts.includes(application.product_id)) {
            return [];
        }

        const address: AddressDto = {
            streetAddress: application.streetAddress,
            city: application.city,
            state: application.state,
            zip: application.zip,
        };

        // validate address before sending it to the API. Throws an error if the address is invalid
        this.hazardhubUtil.validateAddress(address);

        const { risks, enhanced_property } = await this.ampApiIntegration.getHazardhubData(address);

        return [{ ...risks, ...enhanced_property }];
    }
}
