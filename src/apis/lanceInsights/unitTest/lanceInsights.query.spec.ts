/* eslint-disable camelcase */
import { QueryException } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { LanceInsightsQuery } from '../lanceInsights.query';

describe('LanceInsightsQuery', () => {
    let query: LanceInsightsQuery;
    let ampMock: any;
    let mockQueryBuilder: any;
    let trackingMock: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        ampMock = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn(),
            innerJoin: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            join: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
        };

        mockQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            join: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            max: jest.fn().mockReturnThis(),
            as: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            andOn: jest.fn().mockReturnThis(),
        };

        trackingMock = Object.assign(
            jest.fn(() => mockQueryBuilder),
            mockQueryBuilder,
        );

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LanceInsightsQuery,
                { provide: 'Amp', useValue: ampMock },
                { provide: 'TrackingDB', useValue: trackingMock },
            ],
        }).compile();

        query = module.get<LanceInsightsQuery>(LanceInsightsQuery);
        jest.clearAllMocks();
    });

    it('should get application productIDs', async () => {
        ampMock.first.mockResolvedValueOnce({ product_ids: ['123'] });
        const result = await query.findApplication('appID');

        expect(result).toEqual({ product_ids: ['123'] });
    });

    it('should find carrier name', async () => {
        ampMock.first.mockResolvedValueOnce({ name: 'CarrierX' });
        const result = await query.findCarrierNameByProductID('prodID');

        expect(result).toBe('CarrierX');
    });

    it('should throw if carrier name not found', async () => {
        ampMock.first.mockResolvedValueOnce(undefined);
        await expect(query.findCarrierNameByProductID('prodID')).rejects.toThrow(QueryException);
    });

    it('should find approval rules', async () => {
        const expected = [{ rule_id: 1 }];

        ampMock.andWhere.mockResolvedValueOnce(expected);
        const result = await query.findApprovalRules([123]);

        expect(result).toEqual(expected);
    });

    it('should find approved lance runs', async () => {
        const expected = [{ decision: 1 }];

        trackingMock.where.mockResolvedValueOnce(expected);
        const result = await query.findApprovedLanceRuns('appID');

        expect(result).toEqual(expected);
    });

    it('should find failed lance run products', async () => {
        const expected = [{ product_id: '123' }];

        trackingMock.groupBy.mockResolvedValueOnce(expected);
        const result = await query.findFailedLanceRunProducts('appID');

        expect(result).toEqual(expected);
    });

    describe('findLatestFailedLanceRun', () => {
        it('should return latest failed lance run', async () => {
            const expectedResult = [
                {
                    ruleset_id: 101,
                    created: new Date(),
                    item_id: 'app-1',
                    decision: 0,
                },
            ];

            const subquery = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                max: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockResolvedValue(expectedResult),
                as: jest.fn().mockResolvedValue('latest_at'),
            };

            trackingMock.select.mockReturnThis();
            trackingMock.max.mockReturnThis();
            trackingMock.where.mockReturnThis();
            trackingMock.groupBy.mockReturnThis();
            trackingMock.from.mockReturnThis();
            trackingMock.as.mockReturnValue(subquery);

            const mainQuery = {
                select: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                join: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(expectedResult),
            };

            trackingMock.mockReturnValue(mainQuery);

            const result = await query.findLatestFailedLanceRun('app-1');

            expect(result).toEqual(expectedResult);
        });
    });
});
