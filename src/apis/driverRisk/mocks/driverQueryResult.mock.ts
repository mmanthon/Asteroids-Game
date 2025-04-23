/* eslint-disable camelcase */
import { dob, driverID, license, state } from './constants';
import { GetDriverQueryResult } from '../../../shared/interfaces';

export const driverQueryResultMock: GetDriverQueryResult[] = [
    {
        auto_driver_schedule_id: Number(driverID),
        firstname: 'Tiger',
        lastname: 'Woods',
        name: 'Tiger Woods',
        state: state,
        dob: dob,
        license: license,
    },
];
