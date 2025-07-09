/* eslint-disable camelcase */
import { Test, TestingModule } from '@nestjs/testing';

import { DriverRiskQuery } from '../driverRisk.query';

describe('DriverRiskQuery', () => {
    let query: DriverRiskQuery;
    let ampMock: any;

    beforeEach(async () => {
        ampMock = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn(),
            whereRaw: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            raw: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [DriverRiskQuery, { provide: 'Amp', useValue: ampMock }],
        }).compile();

        query = module.get<DriverRiskQuery>(DriverRiskQuery);
    });

    it('should return application by appID', async () => {
        const expected = { item_id: '123' };

        ampMock.first.mockResolvedValueOnce(expected);

        const result = await query.findApplication('123');

        expect(result).toEqual(expected);
        expect(ampMock.where).toHaveBeenCalledWith('item_id', '123');
    });

    it('should return true when license exists', async () => {
        ampMock.first.mockResolvedValueOnce({ license: 'ABC123' });

        const result = await query.driversLicenseExists('ABC123');

        expect(result).toBe(true);
        expect(ampMock.whereRaw).toHaveBeenCalledWith('TRIM(license) = ?', ['ABC123']);
        expect(ampMock.andWhere).toHaveBeenCalledWith('entry_status', 'active');
    });

    it('should return false when license does not exist', async () => {
        ampMock.first.mockResolvedValueOnce(undefined);

        const result = await query.driversLicenseExists('XYZ999');

        expect(result).toBe(false);
    });

    it('should return drivers by appID', async () => {
        const expected = [{ firstname: 'John', lastname: 'Doe' }];

        ampMock.raw.mockReturnValueOnce('TRIM(ads.license) as license');
        ampMock.andWhere.mockResolvedValueOnce(expected);

        const result = await query.getDriversByAppID('app-1');

        expect(result).toEqual(expected);
        expect(ampMock.where).toHaveBeenCalledWith('ads.item_id', 'app-1');
        expect(ampMock.andWhere).toHaveBeenCalledWith('ads.application_endorsement_id', null);
    });

    it('should return driver by license number', async () => {
        const expected = {
            firstname: 'Jane',
            lastname: 'Smith',
            license: '123456',
        };

        ampMock.raw.mockReturnValueOnce('TRIM(ads.license) as license');
        ampMock.first.mockResolvedValueOnce(expected);

        const result = await query.getDriverByLicenseNumber('123456');

        expect(result).toEqual(expected);
        expect(ampMock.whereRaw).toHaveBeenCalledWith('TRIM(ads.license) = ?', ['123456']);
        expect(ampMock.orderBy).toHaveBeenCalledWith('ads.auto_driver_schedule_id', 'desc');
    });

    it('should return endorsements by appID', async () => {
        const expected = [{ application_endorsement_id: 1 }];

        ampMock.where.mockResolvedValueOnce(expected);

        const result = await query.getEndorsementsByAppID('app-99');

        expect(result).toEqual(expected);
        expect(ampMock.leftJoin).toHaveBeenCalledTimes(2);
        expect(ampMock.where).toHaveBeenCalledWith('item_id', 'app-99');
    });
});
