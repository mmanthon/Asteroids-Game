import { Injectable } from '@nestjs/common';

import { LanceInsightsResponseDto } from './dto';
import { LanceInsightsUtil } from './lanceInsights.util';

@Injectable()
export class LanceInsightsService {
    constructor(private readonly lanceInsightsUtil: LanceInsightsUtil) {}

    /**
     * @description get insights for an application
     * @param {string} appID
     * @returns {Promise<LanceInsightsResponseDto[]>}
     */
    async getInsights(appID: string): Promise<LanceInsightsResponseDto[]> {
        const productIDs = await this.lanceInsightsUtil.createApplicationProductIDArray(appID);

        const results = [
            ...(await this.lanceInsightsUtil.processApprovedRuns(appID, productIDs)),
            ...(await this.lanceInsightsUtil.processFailedRuns(appID, productIDs)),
        ];

        // sort results in decending order by timestamp
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return results;
    }
}
