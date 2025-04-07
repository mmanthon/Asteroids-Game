import { Test, TestingModule } from '@nestjs/testing';

import { HazardHubQuery } from '../hazardhub.query';
import { appID, mockAddress } from '../mocks/constants';

describe('HazardhubQuery', () => {
    let query: HazardHubQuery;
    let ampDB: any;

    beforeEach(async () => {
        ampDB = {
            select: jest.fn().mockReturnThis(),
            raw: jest.fn().mockReturnValue('RAM_SQL'),
            from: jest.fn().mockReturnThis(),
            join: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockAddress),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HazardHubQuery,
                {
                    provide: 'Amp',
                    useValue: ampDB,
                },
            ],
        }).compile();

        query = module.get<HazardHubQuery>(HazardHubQuery);
    });

    it('should be defined', () => {
        expect(query).toBeDefined();
    });

    it('should return address from ampDB', async () => {
        const result = await query.getApplicationAddress(appID);

        expect(result).toEqual(mockAddress);
        expect(ampDB.raw).toHaveBeenCalled();
        expect(ampDB.where).toHaveBeenCalledWith('oi.item_id', appID);
    });
});
