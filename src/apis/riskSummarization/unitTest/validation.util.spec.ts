import { RiskSummarizationEntity } from '@ignidus/iscx-backend-utils';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateRiskSummarizationRequestDto } from '../dto';
import { RiskSummarizationValidationUtil } from '../utils/validation.util';

describe('RiskSummarizationValidationUtil', () => {
    let util: RiskSummarizationValidationUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RiskSummarizationValidationUtil,
                { provide: RiskSummarizationEntity, useValue: { findOne: jest.fn() } },
            ],
        }).compile();

        util = module.get<RiskSummarizationValidationUtil>(RiskSummarizationValidationUtil);
    });

    it('should do nothing when userFeedback is not provided', () => {
        const payload: UpdateRiskSummarizationRequestDto = {};

        expect(() => util.validateUserFeedback(payload)).not.toThrow();
    });

    it('should not throw when isHelpful=true without reason/details', () => {
        const payload: UpdateRiskSummarizationRequestDto = {
            userFeedback: {
                isHelpful: true,
                categories: [],
            },
        };

        expect(() => util.validateUserFeedback(payload)).not.toThrow();
    });

    it('should not throw when isHelpful=false and category is provided', () => {
        const payload: UpdateRiskSummarizationRequestDto = {
            userFeedback: { isHelpful: false, categories: ['Incomplete'], additionalDetail: undefined },
        };

        expect(() => util.validateUserFeedback(payload)).not.toThrow();
    });

    it('should throw BadRequestException when isHelpful=false and category is missing', () => {
        const payload: UpdateRiskSummarizationRequestDto = {
            userFeedback: {
                isHelpful: false,
                categories: [],
            },
        };

        expect(() => util.validateUserFeedback(payload)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when isHelpful=false and reason is empty string', () => {
        const payload: UpdateRiskSummarizationRequestDto = {
            userFeedback: { isHelpful: false, categories: [] },
        };

        expect(() => util.validateUserFeedback(payload)).toThrow(BadRequestException);
    });
});
