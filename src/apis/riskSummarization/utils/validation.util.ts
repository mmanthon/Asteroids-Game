import { RiskSummarizationEntity, RiskSummarizationModel } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Injectable } from '@nestjs/common';

import { UpdateRiskSummarizationRequestDto } from '../dto';

@Injectable()
export class RiskSummarizationValidationUtil {
    constructor(private readonly riskSummarizationEntity: RiskSummarizationEntity) {}

    /**
     * @description Validate user feedback in the update request
     * @param {UpdateRiskSummarizationRequestDto} payload - update request payload
     * @returns {void}
     */
    validateUserFeedback(payload: UpdateRiskSummarizationRequestDto): void {
        const { userFeedback } = payload;

        if (!userFeedback) return;

        if (userFeedback.isHelpful === false && (!userFeedback.categories || userFeedback.categories.length === 0)) {
            throw new BadRequestException('Categories are required when isHelpful is false');
        }
    }

    /**
     * @description Validate if risk summarization exists
     * @param  {string} id - risk summarization id
     * @returns {Promise<RiskSummarizationModel>}
     */
    async validateExisting(id: string): Promise<RiskSummarizationModel> {
        const existing = await this.riskSummarizationEntity.findOne(id);

        if (!existing) {
            throw new BadRequestException('Risk Summarization not found');
        }

        return existing;
    }
}
