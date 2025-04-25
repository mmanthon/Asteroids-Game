import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { GetApplicationQueryResult } from './hazardhub.type';

@Injectable()
export class HazardHubQuery {
    constructor(@Inject('Amp') private readonly ampDB: Knex) {}

    /**
     * @description Get the application
     * @param {string} appID
     * @returns {Promise<GetApplicationQueryResult>}
     */
    getApplication(appID: string): Promise<GetApplicationQueryResult> {
        return this.ampDB
            .select(
                'oi.product_ids as product_id',
                'op.js_name as identifier',
                this.ampDB.raw(
                    `CASE 
                       WHEN p.physical_address2 IS NOT NULL 
                       THEN CONCAT(p.physical_address, ' ', p.physical_address2) 
                       ELSE p.physical_address 
                     END AS streetAddress`,
                ),
                'p.physical_city as city',
                'p.physical_state as state',
                'p.physical_zip as zip',
            )
            .from('omga_items as oi')
            .leftJoin('omga_insureds as oin', 'oi.insured_id', 'oin.insured_id')
            .leftJoin('people as p', 'oin.person_id', 'p.person_id')
            .leftJoin('omga_products as op', 'oi.product_ids', 'op.product_id')
            .where('oi.item_id', appID)
            .first();
    }
}
