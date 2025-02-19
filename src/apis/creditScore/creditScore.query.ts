import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { GetDriverQueryResult } from '../../shared/interfaces';

@Injectable()
export class CreditScoreQuery {
    constructor(@Inject('Amp') private readonly ampDB: Knex) {}

    /**
     * @description Get drivers by application ID
     * @param {string} appID
     * @returns {Promise<MvrDriverQueryResult[]>}
     */
    getDriversByAppID(appID: string): Promise<GetDriverQueryResult[]> {
        return this.ampDB
            .select('ads.auto_driver_schedule_id', 'ads.firstname', 'ads.lastname', 'ads.dob')
            .from('omga_auto_driver_schedules as ads')
            .where('ads.item_id', appID)
            .andWhere('ads.application_endorsement_id', null)
            .andWhere('entry_status', 'Active')
            .groupBy('ads.shared_schedule_id');
    }
}
