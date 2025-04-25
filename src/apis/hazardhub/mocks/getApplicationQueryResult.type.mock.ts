/* eslint-disable camelcase */
import { GetApplicationQueryResult } from '../hazardhub.type';
import { mockAddress } from './constants';

export const mockGetApplicationQueryResult: GetApplicationQueryResult = {
    product_id: '93',
    identifier: '67890',
    streetAddress: mockAddress.streetAddress,
    city: mockAddress.city,
    state: mockAddress.state,
    zip: mockAddress.zip,
};
