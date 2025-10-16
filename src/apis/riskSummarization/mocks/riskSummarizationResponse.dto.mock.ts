import { RiskSummarizationStatusEnum } from '@ignidus/iscx-backend-utils';

import { RiskSummarizationResponseDto } from '../dto';
import { riskSummarizationId } from './constants';
import { mockUpdateRiskSummarizationRequestDto } from './updateRiskSummarizationRequest.dto.mock';

export const mockRiskSummarizationResponseDto: RiskSummarizationResponseDto = {
    id: riskSummarizationId,
    appID: 'app-1',
    status: RiskSummarizationStatusEnum.IN_PROGRESS,
    summary: undefined,
    mlResponseTimestamp: undefined,
    failureReason: undefined,
    userFeedbacks: [mockUpdateRiskSummarizationRequestDto.userFeedback],
    createdDate: '2025-01-01',
};
