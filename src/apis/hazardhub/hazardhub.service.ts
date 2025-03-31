/* eslint-disable camelcase */
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
        const address = await this.hazardhubQuery.getApplicationAddress(appID);

        // validate address before sending it to the API. Throws an error if the address is invalid
        this.hazardhubUtil.validateAddress(address);

        const { risks, enhanced_property } = await this.ampApiIntegration.getHazardhubData(address);

        return [{ ...risks, ...enhanced_property }];
    }
}
