import { RiskSummarizationEntity } from '@ignidus/iscx-backend-utils';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateRiskSummarizationRequestDto } from '../dto';
import { mockValidationRiskSummarization, testValidationId } from '../mocks';
import { RiskSummarizationValidationUtil } from '../utils/validation.util';

describe('RiskSummarizationValidationUtil', () => {
    let util: RiskSummarizationValidationUtil;
    let entity: jest.Mocked<RiskSummarizationEntity>;

    beforeEach(async () => {
        const entityMock: Partial<jest.Mocked<RiskSummarizationEntity>> = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [RiskSummarizationValidationUtil, { provide: RiskSummarizationEntity, useValue: entityMock }],
        }).compile();

        util = module.get<RiskSummarizationValidationUtil>(RiskSummarizationValidationUtil);
        entity = module.get<RiskSummarizationEntity>(RiskSummarizationEntity) as jest.Mocked<RiskSummarizationEntity>;
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

    it('should return existing risk summarization when found', async () => {
        entity.findOne.mockResolvedValue(mockValidationRiskSummarization as any);

        const result = await util.validateExisting(testValidationId);

        expect(entity.findOne).toHaveBeenCalledWith(testValidationId);
        expect(result).toEqual(mockValidationRiskSummarization);
    });

    it('should throw BadRequestException when risk summarization not found', async () => {
        entity.findOne.mockResolvedValue(null);

        await expect(util.validateExisting(testValidationId)).rejects.toThrow(BadRequestException);
        expect(entity.findOne).toHaveBeenCalledWith(testValidationId);
    });
});
