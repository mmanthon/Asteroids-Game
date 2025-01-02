/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';

import { HazardHubUtil } from './hazardhub.util';
import { AmpApiIntegration } from '../../external';

@Injectable()
export class HazardhubService {
    constructor(private readonly hazardhubUtil: HazardHubUtil, private readonly ampApiIntegration: AmpApiIntegration) {}

    /**
     * @description Get hazardhub data for a specific application
     * @param {string} appID
     * @returns {Promise<any>}
     */
    async findOne(appID: string): Promise<any> {
        // In the future, we will add logic to handle multiple addresses
        const address = await this.hazardhubUtil.getApplicationAddress(appID);
        const { risks, enhanced_property } = await this.ampApiIntegration.getHazardhubData(address);

        return [{ ...risks, ...enhanced_property }];
    }
}
