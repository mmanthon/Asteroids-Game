/* eslint-disable camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';

import { UtmQuery } from '../utm.query';

type QB = {
    select: jest.Mock;
    from: jest.Mock;
    leftJoin: jest.Mock;
    join: jest.Mock;
    where: jest.Mock;
    first: jest.Mock;
};

function makeBuilder() {
    const qb: QB = {
        select: jest.fn(),
        from: jest.fn(),
        leftJoin: jest.fn(),
        join: jest.fn(),
        where: jest.fn(),
        first: jest.fn(),
    };

    qb.select.mockReturnValue(qb);
    qb.from.mockReturnValue(qb);
    qb.leftJoin.mockReturnValue(qb);
    qb.join.mockReturnValue(qb);
    qb.where.mockReturnValue(qb);
    qb.first.mockResolvedValue(undefined);

    return qb;
}

describe('UtmQuery', () => {
    let module: TestingModule;
    let service: UtmQuery;

    let qb: QB;
    let ampMock: Partial<Knex>;

    beforeEach(async () => {
        qb = makeBuilder();
        ampMock = {
            select: (...args: unknown[]) => qb.select(...args),
        };

        module = await Test.createTestingModule({
            providers: [UtmQuery, { provide: 'Amp', useValue: ampMock as unknown as Knex }],
        }).compile();

        service = module.get(UtmQuery);
        jest.clearAllMocks();
    });

    describe('getApplicationByID', () => {
        it('should build the query correctly and return the first row', async () => {
            const expected = {
                appID: '123',
                insuredCompanyName: 'ACME',
            };

            qb.first.mockResolvedValueOnce(expected);

            const res = await service.getApplicationByID('123');

            expect(qb.select).toHaveBeenCalledWith({
                appID: 'i.item_id',
                insuredCompanyName: 'oi.company_name',
                productID: 'i.product_ids',
                productLabel: 'p.name',
                agencyID: 'a.agency_id',
                agencyName: 'c.name',
                exposureID: 'i.exposure_data_id',
                statusID: 'i.status_id',
            });
            expect(qb.from).toHaveBeenCalledWith('omga_items as i');
            expect(qb.leftJoin).toHaveBeenCalledWith('omga_insureds as oi', 'i.insured_id', 'oi.insured_id');
            expect(qb.leftJoin).toHaveBeenCalledWith('omga_products as p', 'i.product_ids', 'p.product_id');
            expect(qb.leftJoin).toHaveBeenCalledWith('omga_agencies as a', 'i.agency_id', 'a.agency_id');
            expect(qb.leftJoin).toHaveBeenCalledWith('companies as c', 'a.company_id', 'c.company_id');
            expect(qb.where).toHaveBeenCalledWith('i.item_id', '123');
            expect(qb.first).toHaveBeenCalled();

            expect(res).toBe(expected);
        });
    });

    describe('getLinkedProgramType', () => {
        it('should build the query correctly and return the first row', async () => {
            const expected = { programTypeID: 7, programTypeName: 'Linked' };

            qb.first.mockResolvedValueOnce(expected);

            const res = await service.getLinkedProgramType('P-99');

            expect(qb.select).toHaveBeenCalledWith({
                programTypeID: 'opt.program_type_id',
                programTypeName: 'opt.name',
            });
            expect(qb.from).toHaveBeenCalledWith('omga_programs as op');
            expect(qb.join).toHaveBeenCalledWith(
                'omga_programs_to_products as optp',
                'op.program_id',
                'optp.program_id',
            );
            expect(qb.join).toHaveBeenCalledWith(
                'omga_program_types as opt',
                'opt.program_type_id',
                'op.program_type_id',
            );
            expect(qb.where).toHaveBeenCalledWith('optp.product_id', 'P-99');
            expect(qb.first).toHaveBeenCalled();

            expect(res).toBe(expected);
        });
    });

    describe('getDepositRequiredAgencies', () => {
        it('should select from table with the fixed agency_group_id=4', async () => {
            const expected = [{ agency_id: 1 }, { agency_id: 2 }];

            qb.where.mockResolvedValueOnce(expected);

            await service.getDepositRequiredAgencies();

            expect(qb.select).toHaveBeenCalledWith('*');
            expect(qb.from).toHaveBeenCalledWith('omga_agencies_to_agency_groups');
            expect(qb.where).toHaveBeenCalledWith('agency_group_id', 4);
        });
    });

    describe('getExposureData', () => {
        it('should query by exposure_data_id and return first row', async () => {
            const expected = { exposure_data_id: 44, whatever: 'ok' };

            qb.first.mockResolvedValueOnce(expected);

            const res = await service.getExposureData(44);

            expect(qb.select).toHaveBeenCalledWith('*');
            expect(qb.from).toHaveBeenCalledWith('omga_exposure_data');
            expect(qb.where).toHaveBeenCalledWith('exposure_data_id', 44);
            expect(qb.first).toHaveBeenCalled();

            expect(res).toBe(expected);
        });
    });
});
