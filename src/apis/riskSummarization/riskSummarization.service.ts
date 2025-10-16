import { IJWT, RiskSummarizationEntity } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { RiskSummarizationResponseDto, UpdateRiskSummarizationRequestDto } from './dto';
import { RiskSummarizationValidationUtil } from './utils';
import { RiskSummarizationUtil } from './utils/riskSummarization.util';

@Injectable()
export class RiskSummarizationService {
    constructor(
        private readonly riskSummarizationEntity: RiskSummarizationEntity,
        private readonly riskSummarizationUtil: RiskSummarizationUtil,
        private readonly riskSummarizationValidationUtil: RiskSummarizationValidationUtil,
    ) {}

    /**
     * @description Update risk summarization
     * @param {string} id - risk summarization id
     * @param {UpdateRiskSummarizationRequestDto} updateParam - update parameters
     * @param {IJWT} user - user information
     * @returns {Promise<RiskSummarizationResponseDto>}
     */
    async update(
        id: string,
        updateParam: UpdateRiskSummarizationRequestDto,
        user: IJWT,
    ): Promise<RiskSummarizationResponseDto> {
        this.riskSummarizationValidationUtil.validateUserFeedback(updateParam);
        const { userFeedback } = updateParam;

        const existing = await this.riskSummarizationValidationUtil.validateExisting(id);

        if (userFeedback) {
            const updateParams = this.riskSummarizationUtil.buildUserFeedbackUpdate(userFeedback, user.userID);
            const updated = await this.riskSummarizationEntity.updateOne(id, updateParams, user.userID);

            return this.riskSummarizationUtil.formatRiskSummarization(updated);
        }

        return this.riskSummarizationUtil.formatRiskSummarization(existing);
    }
}
