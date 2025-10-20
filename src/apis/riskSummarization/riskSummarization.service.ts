import { IJWT, RiskSummarizationEntity } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { FilterParamsDto, RiskSummarizationResponseDto, UpdateRiskSummarizationRequestDto } from './dto';
import { RiskSummarizationUtil, RiskSummarizationValidationUtil } from './utils';

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
            const userFeedbackUpdate = this.riskSummarizationUtil.buildUserFeedbackUpdate(userFeedback, user.userID);
            const updated = await this.riskSummarizationEntity.updateOne(
                id,
                { userFeedbacks: [...(existing.userFeedbacks || []), userFeedbackUpdate] },
                user.userID,
            );

            return this.riskSummarizationUtil.formatRiskSummarization(updated);
        }

        return this.riskSummarizationUtil.formatRiskSummarization(existing);
    }

    /**
     * @description Find all risk summarizations
     * @param {FilterParamsDto} filter - filter parameters
     * @returns {Promise<RiskSummarizationResponseDto[]>} list of risk summarizations
     */
    async findAll(filter: FilterParamsDto): Promise<RiskSummarizationResponseDto[]> {
        const items = await this.riskSummarizationUtil.fetchRiskSummarizations(filter);

        return items.map((item) => this.riskSummarizationUtil.formatRiskSummarization(item));
    }
}
