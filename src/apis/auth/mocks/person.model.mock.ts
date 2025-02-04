/* eslint-disable camelcase */
import { PersonModel } from '@ignidus/iscx-backend-utils';

import { personID, userEmail, userFirstName, userLastName, userPhone } from './constants.mock';

export const personModelMock: PersonModel = {
    person_id: Number(personID),
    first: userFirstName,
    last: userLastName,
    address: '123 Mock St',
    city: 'Mock City',
    state: 'MC',
    zip: '12345',
    country: 'USA',
    physical_address: '123 Mock St',
    physical_city: 'Mock City',
    physical_state: 'MC',
    physical_zip: '12345',
    phone: userPhone,
    email: userEmail,
    same_addresses: 1,
};
