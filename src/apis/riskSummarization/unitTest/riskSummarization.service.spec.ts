import {
    IJWT,
    RiskSummarizationEntity,
    RiskSummarizationModel,
    UpdateRiskSummarizationParams,
} from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { userID } from '../../../apis/auth/mocks';
import { RiskSummarizationResponseDto, UpdateRiskSummarizationRequestDto } from '../dto';
import { mockRiskSummarizationModel } from '../mocks';
import { RiskSummarizationService } from '../riskSummarization.service';
import { RiskSummarizationValidationUtil } from '../utils';
import { RiskSummarizationUtil } from '../utils/riskSummarization.util';

describe('RiskSummarizationService', () => {
    let service: RiskSummarizationService;
    let entity: jest.Mocked<RiskSummarizationEntity>;
    let util: jest.Mocked<RiskSummarizationUtil>;
    let validation: jest.Mocked<RiskSummarizationValidationUtil>;

    const user = { userID: userID } as IJWT;

    const updatedModel: RiskSummarizationModel = {
        ...mockRiskSummarizationModel,
        userFeedbacks: [
            {
                isHelpful: true,
                userID: userID,
                timestamp: '2025-01-01T00:00:00.000Z',
            },
        ],
        updatedBy: userID,
    };

    beforeEach(async () => {
        const entityMock: Partial<jest.Mocked<RiskSummarizationEntity>> = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
        };

        const utilMock: Partial<jest.Mocked<RiskSummarizationUtil>> = {
            formatRiskSummarization: jest.fn(),
            buildUserFeedbackUpdate: jest.fn(),
        };

        const validateMock = {
            validateUserFeedback: jest.fn(),
            validateExisting: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RiskSummarizationService,
                { provide: RiskSummarizationEntity, useValue: entityMock },
                { provide: RiskSummarizationUtil, useValue: utilMock },
                { provide: RiskSummarizationValidationUtil, useValue: validateMock },
            ],
        }).compile();

        service = module.get(RiskSummarizationService);
        entity = module.get(RiskSummarizationEntity) as jest.Mocked<RiskSummarizationEntity>;
        util = module.get(RiskSummarizationUtil) as jest.Mocked<RiskSummarizationUtil>;
        validation = module.get(RiskSummarizationValidationUtil) as jest.Mocked<RiskSummarizationValidationUtil>;
    });

    it('should update feedback (helpful=true) and return formatted result', async () => {
        const dto: UpdateRiskSummarizationRequestDto = {
            userFeedback: {
                isHelpful: true,
                categories: [],
            },
        };

        entity.findOne.mockResolvedValue(mockRiskSummarizationModel);
        const updateParams: UpdateRiskSummarizationParams = {
            userFeedbacks: [
                {
                    isHelpful: true,
                    userID: userID,
                    timestamp: expect.any(String),
                },
            ],
        };

        util.buildUserFeedbackUpdate.mockReturnValue(updateParams);
        entity.updateOne.mockResolvedValue(updatedModel);

        const formatted: RiskSummarizationResponseDto = {
            id: updatedModel.id,
            appID: updatedModel.appID,
            status: updatedModel.status,
            createdDate: '2025-01-01',
            userFeedbacks: [
                {
                    isHelpful: true,
                    categories: [],
                },
            ],
        };

        util.formatRiskSummarization.mockReturnValue(formatted);

        const result = await service.update('rs-1', dto, user);

        expect(validation.validateExisting).toHaveBeenCalledWith(mockRiskSummarizationModel.id);
        expect(validation.validateUserFeedback).toHaveBeenCalledWith(dto);

        expect(util.buildUserFeedbackUpdate).toHaveBeenCalledWith(dto.userFeedback, userID);
        expect(entity.updateOne).toHaveBeenCalledWith('rs-1', updateParams, userID);
        expect(util.formatRiskSummarization).toHaveBeenCalledWith(updatedModel);
        expect(result).toEqual(formatted);
    });

    it('should update with reason/details when isHelpful=false and reason provided', async () => {
        const dto: UpdateRiskSummarizationRequestDto = {
            userFeedback: {
                isHelpful: false,
                categories: ['Incomplete'],
                additionalDetail: 'Missing docs',
            },
        };

        const updatedWithReason: RiskSummarizationModel = {
            ...mockRiskSummarizationModel,
            userFeedbacks: [
                {
                    isHelpful: false,
                    categories: ['Incomplete'],
                    additionalDetail: 'Missing docs',
                    userID: userID,
                    timestamp: '',
                },
            ],
        };

        const updateParams: UpdateRiskSummarizationParams = {
            userFeedbacks: [
                {
                    isHelpful: false,
                    categories: ['Incomplete'],
                    additionalDetail: 'Missing docs',
                    userID: userID,
                    timestamp: '',
                },
            ],
        };

        const formatted: RiskSummarizationResponseDto = {
            id: updatedWithReason.id,
            appID: updatedWithReason.appID,
            status: updatedWithReason.status,
            createdDate: '2025-01-01',
            userFeedbacks: [
                {
                    isHelpful: false,
                    categories: ['Incomplete'],
                    additionalDetail: 'Missing docs',
                },
            ],
        };

        util.buildUserFeedbackUpdate.mockReturnValue(updateParams);

        entity.findOne.mockResolvedValue(mockRiskSummarizationModel);
        entity.updateOne.mockResolvedValue(updatedWithReason);

        util.formatRiskSummarization.mockReturnValue(formatted);

        const result = await service.update('rs-1', dto, user);

        expect(validation.validateUserFeedback).toHaveBeenCalledWith(dto);
        expect(util.buildUserFeedbackUpdate).toHaveBeenCalledWith(dto.userFeedback, userID);
        expect(entity.updateOne).toHaveBeenCalledWith('rs-1', updateParams, userID);
        expect(result).toEqual(formatted);
    });

    it('should return formatted existing when no userFeedback is provided', async () => {
        const dto: UpdateRiskSummarizationRequestDto = {};

        entity.findOne.mockResolvedValue(mockRiskSummarizationModel);

        const formattedExisting: RiskSummarizationResponseDto = {
            id: mockRiskSummarizationModel.id,
            appID: mockRiskSummarizationModel.appID,
            status: mockRiskSummarizationModel.status,
            createdDate: '2025-01-01',
            userFeedbacks: [],
        };

        util.formatRiskSummarization.mockReturnValue(formattedExisting);

        const result = await service.update('rs-1', dto, user);

        expect(entity.updateOne).not.toHaveBeenCalled();
        expect(result).toEqual(formattedExisting);
    });
});
