import { RiskSummarizationModel, RiskSummarizationStatusEnum } from '@ignidus/iscx-backend-utils';

export const mockRiskSummarizationModel: RiskSummarizationModel = {
    id: 'rs-1',
    appID: 'app-1',
    requestID: 'req-1',
    status: RiskSummarizationStatusEnum.IN_PROGRESS,
    updatedBy: 'u-1',
    updatedDate: '2025-01-01T00:00:00.000Z',
    createdDate: '2025-01-01T00:00:00.000Z',
    mlRequest: {},
};
