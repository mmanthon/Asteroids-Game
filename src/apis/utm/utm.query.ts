import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { IAmpAgenciesToAgencyGroup, IAmpApplication, IAmpExposureData, IAmpLinkedProgramType } from './interface';

@Injectable()
export class UtmQuery {
    constructor(@Inject('Amp') private readonly amp: Knex) {}

    /**
     * @description Get application by ID
     * @param {string} appID
     * @returns {Promise<IAmpApplication>}
     */
    getApplicationByID(appID: string): Promise<IAmpApplication> {
        return this.amp
            .select({
                appID: 'i.item_id',
                insuredCompanyName: 'oi.company_name',
                productID: 'i.product_ids',
                productLabel: 'p.name',
                agencyID: 'a.agency_id',
                agencyName: 'c.name',
                exposureID: 'i.exposure_data_id',
                statusID: 'i.status_id',
            })
            .from('omga_items as i')
            .leftJoin('omga_insureds as oi', 'i.insured_id', 'oi.insured_id')
            .leftJoin('omga_products as p', 'i.product_ids', 'p.product_id')
            .leftJoin('omga_agencies as a', 'i.agency_id', 'a.agency_id')
            .leftJoin('companies as c', 'a.company_id', 'c.company_id')
            .where('i.item_id', appID)
            .first();
    }

    /**
     * @description Get linked program type
     * @param {string} productID
     * @returns {Promise<IAmpLinkedProgramType>}
     */
    getLinkedProgramType(productID: string): Promise<IAmpLinkedProgramType> {
        return this.amp
            .select({
                programTypeID: 'opt.program_type_id',
                programTypeName: 'opt.name',
            })
            .from('omga_programs as op')
            .join('omga_programs_to_products as optp', 'op.program_id', 'optp.program_id')
            .join('omga_program_types as opt', 'opt.program_type_id', 'op.program_type_id')
            .where('optp.product_id', productID)
            .first();
    }

    /**
     * @description Get deposit required agencies
     * @returns {Promise<IAmpAgenciesToAgencyGroup[]>}
     */
    getDepositRequiredAgencies(): Promise<IAmpAgenciesToAgencyGroup[]> {
        return this.amp.select('*').from('omga_agencies_to_agency_groups').where('agency_group_id', 4);
    }

    /**
     * @description Get expsoure data
     * @param {number} exposureID
     * @returns {Promise<IAmpExposureData>}
     */
    getExposureData(exposureID: number): Promise<IAmpExposureData> {
        return this.amp.select('*').from('omga_exposure_data').where('exposure_data_id', exposureID).first();
    }
}
