import { Test } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { mockAgentDto } from '../mocks';

describe('ApplicationQuery', () => {
    let query: ApplicationQuery;
    let ampDB: any;

    beforeEach(async () => {
        ampDB = {
            raw: jest.fn().mockImplementation((sql) => sql),
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockAgentDto),
        };
        const module = await Test.createTestingModule({
            providers: [
                ApplicationQuery,
                {
                    provide: 'Amp',
                    useValue: ampDB,
                },
            ],
        }).compile();

        query = module.get<ApplicationQuery>(ApplicationQuery);
    });

    it('should be defined', () => {
        expect(query).toBeDefined();
    });

    it('should return agent info from ampDB', async () => {
        const result = await query.getAgentInfoByUserId('123');

        expect(result).toEqual(mockAgentDto);
        expect(ampDB.where).toHaveBeenCalledWith('u.user_id', '123');
    });
});
