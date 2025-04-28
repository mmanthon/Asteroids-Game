/* eslint-disable camelcase */
import { GetLinkedProductResult } from '../interfaces';
import { programID, programTypeID } from './constants.mock';

export const mockLinkedProducts: GetLinkedProductResult[] = [
    {
        product_id: 321,
        product_name: 'Product 2',
        program_id: programID,
        program_type_id: programTypeID,
        carrier_name: 'Carrier 2',
    },
];
