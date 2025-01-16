/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';

import { HazardHubQuery } from './hazardhub.query';
import { HazardHubUtil } from './hazardhub.util';
import { AmpApiIntegration } from '../../external';

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
     * @returns {Promise<any>}
     */
    async findOne(appID: string): Promise<any> {
        // TODO: In the future, we will add logic to handle multiple addresses
        // TODO: Create a dto for the response
        const address = await this.hazardhubQuery.getApplicationAddress(appID);

        // validate address before sending it to the API. Throws an error if the address is invalid
        this.hazardhubUtil.validateAddress(address);

        const { risks, enhanced_property } = await this.ampApiIntegration.getHazardhubData(address);

        return [{ ...risks, ...enhanced_property }];
    }
}
