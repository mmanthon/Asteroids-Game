import { ItemModel } from '@ignidus/iscx-backend-utils';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { GetEndorsementQueryResult } from './interfaces';
import { GetDriverQueryResult } from '../../shared/interfaces';

@Injectable()
export class DriverRiskQuery {
    constructor(@Inject('Amp') private readonly amp: Knex) {}

    /**
     * @description get application
     * @param {string} appID
     * @returns {Promise<ItemModel>}
     */
    findApplication(appID: string): Promise<ItemModel> {
        return this.amp.select('*').from('omga_items').where('item_id', appID).first();
    }

    /**
     * @description Determine if licenseNumber exists in the database
     * @param {string} licenseNumber
     * @returns {Promise<boolean>}
     */
    driversLicenseExists(licenseNumber: string): Promise<boolean> {
        return this.amp
            .select('license')
            .from('omga_auto_driver_schedules')
            .whereRaw('TRIM(license) = ?', [licenseNumber])
            .andWhere('entry_status', 'active')
            .first()
            .then((result) => !!result);
    }

    /**
     * @description Get drivers by application ID
     * @param {string} appID
     * @returns {Promise<MvrDriverQueryResult[]>}
     */
    getDriversByAppID(appID: string): Promise<GetDriverQueryResult[]> {
        return this.amp
            .select(
                'ads.auto_driver_schedule_id',
                'ads.firstname',
                'ads.lastname',
                'ads.state',
                'ads.dob',
                this.amp.raw('TRIM(ads.license) as license'),
            )
            .from('omga_auto_driver_schedules as ads')
            .where('ads.item_id', appID)
            .andWhere('ads.application_endorsement_id', null);
    }

    /**
     * @description get drivers by license number
     * @param {string} licenseNumber
     * @returns {Promise<MvrDriverQueryResult>}
     */
    getDriverByLicenseNumber(licenseNumber: string): Promise<GetDriverQueryResult> {
        return this.amp
            .select(
                'ads.firstname',
                'ads.lastname',
                'ads.state',
                'ads.dob',
                this.amp.raw('TRIM(ads.license) as license'),
            )
            .from('omga_auto_driver_schedules as ads')
            .whereRaw('TRIM(ads.license) = ?', [licenseNumber])
            .orderBy('ads.auto_driver_schedule_id', 'desc')
            .first();
    }

    /**
     * @description Get endorsements by application ID
     * @param {string} appID
     * @returns {Promise<GetEndorsementQueryResult[]>}
     */
    getEndorsementsByAppID(appID: string): Promise<GetEndorsementQueryResult[]> {
        return this.amp
            .select(
                'ae.application_endorsement_id',
                'ae.data',
                'ae.created',
                'ae.endorsed_at',
                'es.name as status_name',
                'ek.value as encryption_key',
            )
            .from('omga_application_endorsements as ae')
            .leftJoin('encryption_keys as ek', 'ek.name', 'ae.encryption_key_id')
            .leftJoin('omga_endorsement_statuses as es', 'es.endorsement_status_id', 'ae.endorsement_status_id')
            .where('item_id', appID);
    }
}
