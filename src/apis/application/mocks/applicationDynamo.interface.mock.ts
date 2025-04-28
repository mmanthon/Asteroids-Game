import {
    ApplicationDynamoModel,
    ApplicationStatusIDEnum,
    ApplicationStatusNameEnum,
} from '@ignidus/iscx-backend-utils';

import { appID, dateToFormat, policyNumber, productID, submissionID, totalCost } from './constants.mock';

export const mockApplicationDynamoModel: ApplicationDynamoModel = {
    id: appID,
    submissionID: submissionID,
    effectiveDate: dateToFormat,
    expirationDate: '2026-04-01T00:00:00Z',
    boundDate: dateToFormat,
    policyNo: policyNumber,
    product: {
        id: String(productID),
        version: 1,
    },
    status: ApplicationStatusNameEnum.IN_PROGRESS,
    statusID: ApplicationStatusIDEnum.IN_PROGRESS,
    totalCost: totalCost,
    answers: [
        {
            sectionGroupID: '1',
            questions: [
                {
                    answer: 'test answer',
                    source: 'test souce',
                },
            ],
        },
    ],
};

export const mockIncompleteApplicationDynamoModel: ApplicationDynamoModel = {
    id: '',
    answers: [],
    product: { id: '', version: 0 },
    submissionID: undefined,
    effectiveDate: undefined,
    expirationDate: undefined,
    boundDate: undefined,
    policyNo: undefined,
};
