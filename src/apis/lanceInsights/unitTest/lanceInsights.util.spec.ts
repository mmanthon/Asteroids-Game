/* eslint-disable camelcase */
import { Test, TestingModule } from '@nestjs/testing';

import { LanceInsightsQuery } from '../lanceInsights.query';
import { LanceInsightsUtil } from '../lanceInsights.util';
import {
    mockApprovalHistoryQueryResults,
    mockApprovalRuleQueryResults,
    mockLanceInsightProductDto,
    mockLanceInsightsResponseDto,
    mockLanceInsightsResponseDtoFail,
} from '../mocks';
import { FailedLanceRunsQueryResults, OneOrZero, RuleType } from '../types';

describe('LanceInsightsUtil', () => {
    let util: LanceInsightsUtil;
    let query: LanceInsightsQuery;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LanceInsightsUtil,
                {
                    provide: LanceInsightsQuery,
                    useValue: {
                        findApplication: jest.fn(),
                        findFailedLanceRunProducts: jest.fn(),
                        findLanceNotes: jest.fn(),
                        findLatestFailedLanceRun: jest.fn(),
                        findLinkedProducts: jest.fn(),
                        findApprovedLanceRuns: jest.fn(),
                        findApprovalRules: jest.fn(),
                        findCarrierNameByProductID: jest.fn(),
                    },
                },
            ],
        }).compile();

        util = module.get<LanceInsightsUtil>(LanceInsightsUtil);
        query = module.get<LanceInsightsQuery>(LanceInsightsQuery);
    });

    describe('createApplicationProductIDArray', () => {
        it('should return application product ID and linked product IDs', async () => {
            jest.spyOn(query, 'findApplication').mockResolvedValue({ product_ids: 'product-app-1' });
            jest.spyOn(query, 'findLinkedProducts').mockResolvedValue([
                { product_id: 'product-linked-1' },
                { product_id: 'product-linked-2' },
            ]);

            const result = await util.createApplicationProductIDArray('app-123');

            expect(query.findApplication).toHaveBeenCalledWith('app-123');
            expect(query.findLinkedProducts).toHaveBeenCalledWith('app-123');
            expect(result).toEqual(['product-app-1', 'product-linked-1', 'product-linked-2']);
        });

        it('should return only the application product ID if there are no linked products', async () => {
            jest.spyOn(query, 'findApplication').mockResolvedValue({ product_ids: 'product-app-2' });
            jest.spyOn(query, 'findLinkedProducts').mockResolvedValue([]);

            const result = await util.createApplicationProductIDArray('app-456');

            expect(result).toEqual(['product-app-2']);
        });
    });

    describe('processApprovedRuns', () => {
        const expectedCarrierMap = {
            '83': mockLanceInsightProductDto.carrierName,
        };

        it('should return results for approved lance runs', async () => {
            jest.spyOn(query, 'findApprovedLanceRuns').mockResolvedValue(mockApprovalHistoryQueryResults);
            jest.spyOn(query, 'findApprovalRules').mockResolvedValue(mockApprovalRuleQueryResults);
            jest.spyOn(query, 'findCarrierNameByProductID').mockImplementation((productID: string) =>
                Promise.resolve(expectedCarrierMap[productID]),
            );

            const result = await util.processApprovedRuns(mockLanceInsightsResponseDto.appID, ['83']);

            expect(query.findApprovedLanceRuns).toHaveBeenCalledWith(mockLanceInsightsResponseDto.appID);
            expect(query.findApprovalRules).toHaveBeenCalledWith([101]);
            expect(result).toEqual([mockLanceInsightsResponseDto]);
        });
    });

    describe('processFailedRuns', () => {
        it('should return failed results when special failure reason is present', async () => {
            const specialNote = {
                note: 'Something something FOUR_POWER_UNIT failure here',
                written: new Date('2024-01-01T00:00:00.000Z'),
            };

            jest.spyOn(query, 'findLanceNotes').mockResolvedValue([specialNote]);
            jest.spyOn(query, 'findFailedLanceRunProducts').mockResolvedValue([{ product_id: '84' }]);
            jest.spyOn(query, 'findLatestFailedLanceRun').mockResolvedValue(mockApprovalHistoryQueryResults);
            jest.spyOn(query, 'findApprovalRules').mockResolvedValue(mockApprovalRuleQueryResults);
            jest.spyOn(query, 'findCarrierNameByProductID').mockImplementation(() => Promise.resolve('Trinity'));

            const result = await util.processFailedRuns(mockLanceInsightsResponseDtoFail.appID, ['84']);

            expect(query.findLanceNotes).toHaveBeenCalledWith(mockLanceInsightsResponseDtoFail.appID);
            expect(query.findLatestFailedLanceRun).toHaveBeenCalledWith(mockLanceInsightsResponseDtoFail.appID);
            expect(query.findApprovalRules).toHaveBeenCalledWith([101]);
            expect(result).toEqual([
                {
                    appID: mockLanceInsightsResponseDtoFail.appID,
                    status: 'fail',
                    timestamp: specialNote.written.toISOString(),
                    products: [
                        {
                            productID: '84',
                            status: 'fail',
                            carrierName: 'Trinity',
                            rules: mockLanceInsightProductDto.rules,
                        },
                    ],
                },
            ]);
        });

        it('should return failed results when no special failure reason is present', async () => {
            const genericNote = {
                note: 'No power unit mentioned here',
                written: new Date('2024-01-01T00:00:00.000Z'),
            };

            const failedProducts: FailedLanceRunsQueryResults = [{ product_id: '84' }];

            jest.spyOn(query, 'findLanceNotes').mockResolvedValue([genericNote]);
            jest.spyOn(query, 'findFailedLanceRunProducts').mockResolvedValue(failedProducts);
            jest.spyOn(query, 'findLatestFailedLanceRun').mockResolvedValue(mockApprovalHistoryQueryResults);
            jest.spyOn(query, 'findApprovalRules').mockResolvedValue(mockApprovalRuleQueryResults);
            jest.spyOn(query, 'findCarrierNameByProductID').mockImplementation(() => Promise.resolve('Trinity'));

            const result = await util.processFailedRuns(mockLanceInsightsResponseDtoFail.appID, ['84']);

            expect(query.findLanceNotes).toHaveBeenCalledWith(mockLanceInsightsResponseDtoFail.appID);
            expect(query.findFailedLanceRunProducts).toHaveBeenCalledWith(mockLanceInsightsResponseDtoFail.appID);
            expect(query.findLatestFailedLanceRun).toHaveBeenCalledWith(mockLanceInsightsResponseDtoFail.appID);
            expect(query.findApprovalRules).toHaveBeenCalledWith([101]);
            expect(result).toEqual([
                {
                    appID: mockLanceInsightsResponseDtoFail.appID,
                    status: 'fail',
                    timestamp: genericNote.written.toISOString(),
                    products: [
                        {
                            productID: '84',
                            status: 'fail',
                            carrierName: 'Trinity',
                            rules: {
                                fail: [],
                                pass: [
                                    {
                                        label: 'Check answer to Accidents: must be be equal to none for auto-approval',
                                        sequence: 1,
                                    },
                                ],
                            },
                        },
                    ],
                },
            ]);
        });
    });

    describe('processFailedRuns label generation', () => {
        const sharedNote = {
            note: 'irrelevant note',
            written: new Date('2024-01-01T00:00:00.000Z'),
        };

        const baseRun = {
            ruleset_id: 101,
            created: new Date(),
            history_id: 0,
            item_id: '',
            decision: 0 as OneOrZero,
        };

        const baseApprovalRule = {
            ruleset_id: 101,
            rule_id: 1,
            sequence: 1,
        };

        const setupCommonMocks = (ruleType: string, data: any = {}, error = '') => {
            jest.spyOn(query, 'findLanceNotes').mockResolvedValue([sharedNote]);
            jest.spyOn(query, 'findFailedLanceRunProducts').mockResolvedValue([{ product_id: '84' }]);
            jest.spyOn(query, 'findLatestFailedLanceRun').mockResolvedValue([baseRun]);
            jest.spyOn(query, 'findApprovalRules').mockResolvedValue([
                { ...baseApprovalRule, data, error, type: ruleType as RuleType },
            ]);
            jest.spyOn(query, 'findCarrierNameByProductID').mockResolvedValue('Carrier');
        };

        test.each([
            [
                'cab_data_factors',
                { field: 'distance', operator: '==', value: '1000' },
                'cab_data_error',
                'Distance must be be equal to 1000',
            ],
            [
                'iss_score',
                { operator: '<', value: '75', field: '' },
                'iss_score_error',
                'ISS Score must be less than 75',
            ],
            ['dot_rating', { field: '' }, 'dot_rating_error', 'DOT Rating must be approved'],
            [
                'endorsement_check',
                { field: 'abc_field', operator: '!=', value: 'some_value' },
                'endorsement_check_error',
                'Abc Field not be equal to some_value',
            ],
            [
                'classcode_check',
                { field: 'class_code', operator: '==', value: 'X123' },
                'classcode_error',
                'Class Code must be be equal to X123',
            ],
        ])('should return correct label for %s rule type', async (ruleType, data, error, expectedLabel) => {
            setupCommonMocks(ruleType, data, error);

            const result = await util.processFailedRuns('app-1', ['84']);

            expect(result[0].products[0].rules.pass[0].label).toEqual(expectedLabel);
        });
    });
});
