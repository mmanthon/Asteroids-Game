import {
    IJWT,
    RiskSummarizationEntity,
    RiskSummarizationModel,
    RiskSummarizationStatusEnum,
} from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { userID } from '../../../apis/auth/mocks';
import { FilterParamsDto, RiskSummarizationResponseDto, UpdateRiskSummarizationRequestDto } from '../dto';
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
            fetchRiskSummarizations: jest.fn(),
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

        validation.validateExisting.mockResolvedValue(mockRiskSummarizationModel);
        const userFeedbackUpdate = {
            isHelpful: true,
            userID: userID,
            timestamp: expect.any(String),
        };

        util.buildUserFeedbackUpdate.mockReturnValue(userFeedbackUpdate);
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

        expect(validation.validateExisting).toHaveBeenCalledWith('rs-1');
        expect(validation.validateUserFeedback).toHaveBeenCalledWith(dto);

        expect(util.buildUserFeedbackUpdate).toHaveBeenCalledWith(dto.userFeedback, userID);
        expect(entity.updateOne).toHaveBeenCalledWith(
            'rs-1',
            { userFeedbacks: [...(mockRiskSummarizationModel.userFeedbacks || []), userFeedbackUpdate] },
            userID,
        );
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

        const userFeedbackUpdate = {
            isHelpful: false,
            categories: ['Incomplete'],
            additionalDetail: 'Missing docs',
            userID: userID,
            timestamp: '',
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

        util.buildUserFeedbackUpdate.mockReturnValue(userFeedbackUpdate);

        validation.validateExisting.mockResolvedValue(mockRiskSummarizationModel);
        entity.updateOne.mockResolvedValue(updatedWithReason);

        util.formatRiskSummarization.mockReturnValue(formatted);

        const result = await service.update('rs-1', dto, user);

        expect(validation.validateUserFeedback).toHaveBeenCalledWith(dto);
        expect(util.buildUserFeedbackUpdate).toHaveBeenCalledWith(dto.userFeedback, userID);
        expect(entity.updateOne).toHaveBeenCalledWith(
            'rs-1',
            { userFeedbacks: [...(mockRiskSummarizationModel.userFeedbacks || []), userFeedbackUpdate] },
            userID,
        );
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

    it('should delegate to util.fetchRiskSummarizations and format each item', async () => {
        const filter: FilterParamsDto = { appID: '3730781' };
        const mockRiskSummarizationModels: RiskSummarizationModel[] = [
            {
                ...mockRiskSummarizationModel,
                id: 'a',
                appID: '3730781',
                status: RiskSummarizationStatusEnum.COMPLETED,
                createdDate: '2025-10-15',
                userFeedbacks: [],
            },
            {
                ...mockRiskSummarizationModel,
                id: 'b',
                appID: '3730781',
                status: RiskSummarizationStatusEnum.COMPLETED,
                createdDate: '2025-10-16',
                userFeedbacks: [],
            },
        ];

        const formatted: RiskSummarizationResponseDto[] = [
            {
                id: 'a',
                appID: '3730781',
                status: RiskSummarizationStatusEnum.COMPLETED,
                createdDate: '2025-10-15',
                userFeedbacks: [],
            },
            {
                id: 'b',
                appID: '3730781',
                status: RiskSummarizationStatusEnum.COMPLETED,
                createdDate: '2025-10-16',
                userFeedbacks: [],
            },
        ];

        util.fetchRiskSummarizations.mockResolvedValue(mockRiskSummarizationModels);
        util.formatRiskSummarization.mockReturnValueOnce(formatted[0]).mockReturnValueOnce(formatted[1]);

        const result = await service.findAll(filter);

        expect(util.fetchRiskSummarizations).toHaveBeenCalledTimes(1);
        expect(util.fetchRiskSummarizations).toHaveBeenCalledWith(filter);

        expect(util.formatRiskSummarization).toHaveBeenCalledTimes(mockRiskSummarizationModels.length);
        expect(util.formatRiskSummarization).toHaveBeenNthCalledWith(1, mockRiskSummarizationModels[0]);
        expect(util.formatRiskSummarization).toHaveBeenNthCalledWith(2, mockRiskSummarizationModels[1]);

        expect(result).toEqual(formatted);
        expect(result).toEqual(formatted);
    });

    it('should return empty array when util returns no items', async () => {
        util.fetchRiskSummarizations.mockResolvedValue([]);
        const result = await service.findAll({} as FilterParamsDto);

        expect(util.fetchRiskSummarizations).toHaveBeenCalledWith({});
        expect(util.formatRiskSummarization).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});
