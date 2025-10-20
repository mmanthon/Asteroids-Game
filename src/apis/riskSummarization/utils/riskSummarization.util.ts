import {
    RiskSummarizationEntity,
    RiskSummarizationModel,
    UserFeedback,
    getCurrentDate,
} from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { FilterParamsDto, RiskSummarizationResponseDto, UserFeedbackDto } from '../dto';

@Injectable()
export class RiskSummarizationUtil {
    constructor(private readonly riskSummarizationEntity: RiskSummarizationEntity) {}

    /**
     * @description Format risk summarization
     * @param {RiskSummarizationModel} riskSummarization - risk summarization to format
     * @returns {RiskSummarizationResponseDto}
     */
    formatRiskSummarization(riskSummarization: RiskSummarizationModel): RiskSummarizationResponseDto {
        return {
            id: riskSummarization.id,
            appID: riskSummarization.appID,
            status: riskSummarization.status,
            summary: riskSummarization.mlResponse
                ? {
                      description: riskSummarization.mlResponse.risk_summary,
                      preferredAttributes: riskSummarization.mlResponse.preferred_attributes,
                      standardAttributes: riskSummarization.mlResponse.standard_attributes,
                      nonStandardAttributes: riskSummarization.mlResponse.non_standard_attributes,
                  }
                : undefined,
            mlResponseTimestamp: riskSummarization.mlResponseTimestamp,
            failureReason: riskSummarization.failureReason,
            userFeedbacks: riskSummarization.userFeedbacks
                ? riskSummarization.userFeedbacks.map((feedback) => ({
                      ...feedback,
                      categories: feedback.categories || [],
                  }))
                : [],
            createdDate: riskSummarization.createdDate,
        };
    }

    /**
     * @description Build update parameters for user feedback
     * @param {UserFeedbackDto} userFeedback - user feedback
     * @param {string} userID - user ID
     * @returns {UpdateRiskSummarizationParams}
     */
    buildUserFeedbackUpdate(userFeedback: UserFeedbackDto, userID: string): UserFeedback {
        return {
            isHelpful: userFeedback.isHelpful,
            categories: userFeedback.categories || [],
            additionalDetail: userFeedback.additionalDetail || '',
            userID,
            timestamp: getCurrentDate(),
        };
    }

    /**
     * @description Fetch risk summarizations based on filter
     * @param {FilterParamsDto} filter - filter parameters
     * @returns {Promise<RiskSummarizationModel[]>}
     */
    async fetchRiskSummarizations(filter: FilterParamsDto): Promise<RiskSummarizationModel[]> {
        const data = filter.appID
            ? await this.riskSummarizationEntity.findAllByAppID(filter.appID)
            : await this.riskSummarizationEntity.findAll();

        return data.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }
}
