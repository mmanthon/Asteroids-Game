/* eslint-disable camelcase */
import { ApplicationStatusDisplayValueEnum } from '@ignidus/iscx-backend-utils';

import { AmpApplication } from '../interfaces';
import {
    agencyName,
    appID,
    createdDate,
    formattedDate,
    groupID,
    lastStatusUpdate,
    productID,
    programID,
    programTypeID,
    totalCost,
    updatedDate,
    userID,
} from './constants.mock';
import { mockInsuredDto } from './insured.dto.mock';
import { mockProductDto } from './product.dto.mock';

export const mockAmpApplication: AmpApplication = {
    item_id: Number(appID),
    created_from_renewal: 0,
    insured_address: mockInsuredDto.address.streetAddress,
    insured_city: mockInsuredDto.address.city,
    insured_state: mockInsuredDto.address.state,
    insured_zip: mockInsuredDto.address.zip,
    insured_phone: mockInsuredDto.phoneNumber,
    insured_email: mockInsuredDto.email,
    group_id: groupID,
    user_id: userID,
    created: createdDate,
    total_cost: totalCost,
    program_id: programID,
    program_type_id: programTypeID,
    product_ids: productID,
    agency_name: agencyName,
    insured_company_name: mockInsuredDto.companyName,
    insured_first_name: mockInsuredDto.firstName,
    insured_last_name: mockInsuredDto.lastName,
    product_name: mockProductDto[0].name,
    carrier_name: mockProductDto[0].carrierName,
    status_name: ApplicationStatusDisplayValueEnum.IN_PROGRESS,
    effective_date: formattedDate,
    last_status_update: lastStatusUpdate,
    first_bound_date: formattedDate,
    last_updated: updatedDate,
};

export const mockAmpApplicationWithMissingFields: AmpApplication = {
    ...mockAmpApplication,
    agency_name: undefined,
    insured_first_name: undefined,
    insured_last_name: undefined,
    insured_company_name: undefined,
    insured_phone: undefined,
    insured_email: undefined,
    insured_address: undefined,
    insured_city: undefined,
    insured_state: undefined,
    insured_zip: undefined,
};

export const mockAmpApplications: AmpApplication[] = [
    {
        ...mockAmpApplication,
    },
    {
        ...mockAmpApplication,
        item_id: 1,
        user_id: 1,
        product_ids: 1,
        insured_first_name: 'Alice',
    },
];
