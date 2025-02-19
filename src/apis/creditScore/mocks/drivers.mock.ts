/* eslint-disable camelcase */
import { GetDriverQueryResult } from '../../../shared/interfaces';

export const mockBadRequestDriverQueryResult = [
    {
        auto_driver_schedule_id: 123,
        firstname: 'John',
        lastname: 'Doe',
    },
];

export const mockDriverQueryResult: GetDriverQueryResult[] = [
    {
        auto_driver_schedule_id: 12345,
        firstname: 'John',
        lastname: 'Doe',
        dob: '1980-01-01',
    },
];
