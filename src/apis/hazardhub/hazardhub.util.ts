import { AddressDto } from '@ignidus/iscx-backend-utils';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class HazardHubUtil {
    constructor(@Inject('Amp') private readonly ampDB: Knex) {}

    /**
     * @description Get the application address
     * @param {string} appID
     * @returns {Promise<any>}
     */
    getApplicationAddress(appID: string): Promise<AddressDto> {
        return this.ampDB
            .select(
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
            .join('omga_insureds as oin', 'oi.insured_id', 'oin.insured_id')
            .join('people as p', 'oin.person_id', 'p.person_id')
            .where('oi.item_id', appID)
            .first();
    }
}
