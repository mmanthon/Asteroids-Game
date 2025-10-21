import { RiskSummarizationModel, RiskSummarizationStatusEnum } from '@ignidus/iscx-backend-utils';

import { testValidationAppID, testValidationId } from './constants';

export const mockValidationRiskSummarization: RiskSummarizationModel = {
    id: testValidationId,
    appID: testValidationAppID,
    requestID: 'req-1',
    status: RiskSummarizationStatusEnum.IN_PROGRESS,
    updatedBy: 'u-1',
    updatedDate: '2025-01-01T00:00:00.000Z',
    createdDate: '2025-01-01T00:00:00.000Z',
    mlRequest: {},
};
