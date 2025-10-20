/* eslint-disable camelcase */
import { RiskSummarizationEntity, RiskSummarizationModel } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { FilterParamsDto } from '../dto';
import { mockRiskSummarizationModel } from '../mocks';
import { RiskSummarizationUtil } from '../utils/riskSummarization.util';

describe('RiskSummarizationUtil', () => {
    let util: RiskSummarizationUtil;
    let riskSummarizationEntity: jest.Mocked<RiskSummarizationEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RiskSummarizationUtil],
            providers: [
                {
                    provide: RiskSummarizationEntity,
                    useValue: {
                        findAll: jest.fn(),
                        findAllByAppID: jest.fn(),
                    },
                },
            ],
        }).compile();

        util = module.get<RiskSummarizationUtil>(RiskSummarizationUtil);
        riskSummarizationEntity = module.get<RiskSummarizationEntity>(
            RiskSummarizationEntity,
        ) as jest.Mocked<RiskSummarizationEntity>;
    });

    it('should format without isHelpful/reason/details when isHelpful is undefined and summary is undefined', () => {
        const model: RiskSummarizationModel = { ...mockRiskSummarizationModel };

        const result = util.formatRiskSummarization(model);

        expect(result).toEqual({
            id: mockRiskSummarizationModel.id,
            appID: mockRiskSummarizationModel.appID,
            status: mockRiskSummarizationModel.status,
            summary: undefined,
            mlResponseTimestamp: undefined,
            userFeedbacks: [],
            failureReason: undefined,
            createdDate: mockRiskSummarizationModel.createdDate,
        });

        expect('isHelpful' in result).toBe(false);
        expect('reason' in result).toBe(false);
        expect('details' in result).toBe(false);
    });

    it('should include mapped summary from mlResponse.risk_summary when present', () => {
        const model: RiskSummarizationModel = {
            ...mockRiskSummarizationModel,
            mlResponse: {
                risk_summary: 'short text',
                preferred_attributes: ['a'],
                standard_attributes: ['b'],
                non_standard_attributes: ['c'],
            },
            mlResponseTimestamp: '2025-01-02T00:00:00.000Z',
        };

        const result = util.formatRiskSummarization(model);

        expect(result.summary).toEqual({
            description: 'short text',
            preferredAttributes: ['a'],
            standardAttributes: ['b'],
            nonStandardAttributes: ['c'],
        });
        expect(result.mlResponseTimestamp).toBe('2025-01-02T00:00:00.000Z');
    });

    it('should map isHelpful=true with empty reason/details at root', () => {
        const model: RiskSummarizationModel = {
            ...mockRiskSummarizationModel,
            userFeedbacks: [
                {
                    isHelpful: true,
                    userID: 'user-1',
                    timestamp: '2025-01-01T00:00:00.000Z',
                },
            ],
        };

        const result = util.formatRiskSummarization(model);

        expect(result.userFeedbacks[0].isHelpful).toBe(true);
        expect(result.userFeedbacks[0].categories).toEqual([]);
        expect(result.userFeedbacks[0].additionalDetail).toBe(undefined);
        expect(result.failureReason).toBeUndefined();
    });

    it('should map isHelpful=false including reason/details at root', () => {
        const model: RiskSummarizationModel = {
            ...mockRiskSummarizationModel,
            userFeedbacks: [
                {
                    isHelpful: false,
                    categories: ['Incomplete'],
                    additionalDetail: 'Missing docs',
                    userID: 'user-1',
                    timestamp: '2025-01-01T00:00:00.000Z',
                },
            ],
        };

        const result = util.formatRiskSummarization(model);

        expect(result.userFeedbacks[0].isHelpful).toBe(false);
        expect(result.userFeedbacks[0].categories).toEqual(['Incomplete']);
        expect(result.userFeedbacks[0].additionalDetail).toBe('Missing docs');
    });

    it('should pass through failureReason when provided', () => {
        const model: RiskSummarizationModel = {
            ...mockRiskSummarizationModel,
            failureReason: 'TIMEOUT',
        };

        const result = util.formatRiskSummarization(model);

        expect(result.failureReason).toBe('TIMEOUT');
    });

    it('should call findAllByAppID when filter.appID is provided', async () => {
        riskSummarizationEntity.findAllByAppID.mockResolvedValue([mockRiskSummarizationModel]);

        const filter: FilterParamsDto = { appID: '3730781' };
        const result = await util.fetchRiskSummarizations(filter);

        expect(riskSummarizationEntity.findAllByAppID).toHaveBeenCalledTimes(1);
        expect(riskSummarizationEntity.findAllByAppID).toHaveBeenCalledWith('3730781');
        expect(riskSummarizationEntity.findAll).not.toHaveBeenCalled();
        expect(result).toEqual([mockRiskSummarizationModel]);
    });

    it('should call findAll when filter.appID is undefined', async () => {
        riskSummarizationEntity.findAll.mockResolvedValue([mockRiskSummarizationModel]);

        const filter = {} as FilterParamsDto;
        const result = await util.fetchRiskSummarizations(filter);

        expect(riskSummarizationEntity.findAll).toHaveBeenCalledTimes(1);
        expect(riskSummarizationEntity.findAllByAppID).not.toHaveBeenCalled();
        expect(result).toEqual([mockRiskSummarizationModel]);
    });

    it('should call findAll when filter.appID is an empty string', async () => {
        riskSummarizationEntity.findAll.mockResolvedValue([mockRiskSummarizationModel]);

        const result = await util.fetchRiskSummarizations({ appID: '' });

        expect(riskSummarizationEntity.findAll).toHaveBeenCalledTimes(1);
        expect(riskSummarizationEntity.findAllByAppID).not.toHaveBeenCalled();
        expect(result).toEqual([mockRiskSummarizationModel]);
    });
});
