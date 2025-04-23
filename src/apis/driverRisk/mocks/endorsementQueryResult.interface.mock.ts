/* eslint-disable camelcase */
import {
    applicationEndorsementID,
    endorsementBoundDate,
    endorsementCreatedDate,
    endorsementData,
    mockEncrptionKey,
    statusDisplayValue,
} from './constants';
import { GetEndorsementQueryResult } from '../interfaces';

export const endorsementQueryResult: GetEndorsementQueryResult = {
    application_endorsement_id: applicationEndorsementID,
    data: endorsementData,
    encryption_key: mockEncrptionKey,
    status_name: statusDisplayValue,
    created: endorsementCreatedDate,
    endorsed_at: endorsementBoundDate,
};
