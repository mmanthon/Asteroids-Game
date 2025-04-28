/* eslint-disable camelcase */

import { productID } from './constants.mock';

export const mockAdditionalProductData = {
    product_id: productID,
    item_id: 123456,
    data: JSON.stringify({ extra: 'value' }),
};
