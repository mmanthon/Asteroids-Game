/* eslint-disable camelcase */
import { ApplicationStatusDisplayValueEnum, ApplicationStatusIDEnum, UsStatesEnum } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';

import { ApplicationQuery } from '../application.query';
import { FilterParamDto } from '../dto';
import {
    agencyID,
    agentID,
    appID,
    mockAgentDto,
    mockAmpApplication,
    mockAmpApplications,
    mockGetAmpNotesByIDResult,
    mockLinkedProducts,
    policyNumber,
    userID,
    userIDs,
} from '../mocks';

describe('ApplicationQuery', () => {
    let query: ApplicationQuery;
    let knexMock: jest.MockedFunction<Knex>;
    let knexStub: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        knexStub = {
            isCount: false,
            count: jest.fn().mockImplementation(function () {
                this.isCount = true;

                return this;
            }),
            select: jest.fn().mockImplementation(function () {
                this.isCount = false;

                return this;
            }),
            from: jest.fn().mockReturnThis(),
            first: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            whereNot: jest.fn().mockReturnThis(),
            whereRaw: jest.fn().mockReturnThis(),
            whereIn: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orWhere: jest.fn().mockReturnThis(),
            join: jest.fn().mockReturnThis(),
            as: jest.fn().mockReturnThis(),
            raw: jest.fn().mockReturnThis(),
            transaction: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            // a no-op default; will be overridden in each test
            then: jest.fn().mockReturnValue(Promise.resolve([])),
            catch: jest.fn().mockImplementation(function (onRejected: any) {
                return Promise.resolve().catch(onRejected);
            }),
        };

        knexStub.transaction = jest.fn();

        knexMock = Object.assign(jest.fn().mockReturnValue(knexStub), {
            select: knexStub.select.bind(knexStub),
            from: knexStub.from.bind(knexStub),
            join: knexStub.join.bind(knexStub),
            where: knexStub.where.bind(knexStub),
            first: knexStub.first.bind(knexStub),
            raw: knexStub.raw.bind(knexStub),
            transaction: knexStub.transaction,
        }) as unknown as jest.MockedFunction<Knex>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [ApplicationQuery, { provide: 'Amp', useValue: knexMock }],
        }).compile();

        query = module.get(ApplicationQuery);
    });

    it('should return a list of applications', async () => {
        const filters: FilterParamDto = { nextPage: 1, pageLimit: 10 };
        const mockTotalCount = 2;

        knexStub.then.mockImplementation(function (onFulfilled: any) {
            const result = this.isCount ? [{ count: mockTotalCount }] : mockAmpApplications;

            return Promise.resolve(result).then(onFulfilled);
        });

        const result = await query.findAll(filters);

        expect(knexStub.select).toHaveBeenCalled();
        expect(knexStub.count).toHaveBeenCalled();
        expect(result.applications).toEqual(mockAmpApplications);
        expect(result.totalPages).toBe(1);
        expect(result.currentPage).toBe(1);
    });

    it('should calculate nextPage when there is more than one page', async () => {
        const filters: FilterParamDto = { nextPage: 1, pageLimit: 10 };

        knexStub.then.mockImplementation(function (onFulfilled: any) {
            const result = this.isCount ? [{ count: 20 }] : mockAmpApplications;

            return Promise.resolve(result).then(onFulfilled);
        });

        const result = await query.findAll(filters);

        expect(result.applications).toEqual(mockAmpApplications);
        expect(result.totalPages).toBe(2);
        expect(result.currentPage).toBe(1);
        expect(result.nextPage).toBe(2);
    });

    it('should return empty applications list when there are no results', async () => {
        const filters: FilterParamDto = { nextPage: 1, pageLimit: 10 };

        knexStub.then.mockImplementation(function (onFulfilled: any) {
            const result = this.isCount ? [{ count: 0 }] : [];

            return Promise.resolve(result).then(onFulfilled);
        });

        const result = await query.findAll(filters);

        expect(result.applications).toEqual([]);
        expect(result.totalPages).toBe(0);
        expect(result.currentPage).toBe(0);
        expect(result.nextPage).toBe(null);
    });

    it('should return true when agency exists', async () => {
        knexStub.first.mockResolvedValueOnce({ agency_id: agencyID });
        const result = await query.agencyExists(String(agencyID));

        expect(result).toBe(true);
    });

    it('should return false when agency does not exist', async () => {
        knexStub.first.mockResolvedValueOnce(undefined);
        const result = await query.agencyExists('000');

        expect(result).toBe(false);
    });

    it('should return true when agent exists', async () => {
        knexStub.first.mockResolvedValueOnce({ user_id: userID });
        const result = await query.agentExists(String(userID));

        expect(result).toBe(true);
    });

    it('should return false when agent does not exist', async () => {
        knexStub.first.mockResolvedValueOnce(undefined);
        const result = await query.agentExists('000');

        expect(result).toBe(false);
    });

    it('should return true when application exists', async () => {
        knexStub.first.mockResolvedValueOnce({ user_id: appID });
        const result = await query.applicationExists(appID);

        expect(result).toBe(true);
    });

    it('should return false when application does not exist', async () => {
        knexStub.first.mockResolvedValueOnce(undefined);
        const result = await query.applicationExists('000');

        expect(result).toBe(false);
    });

    it('should return false when input is empty', async () => {
        const result = await query.productsExist([]);

        expect(result).toEqual({ exists: false, notFoundProducts: [] });
    });

    it('should return true and no notFoundProducts when all products exist', async () => {
        knexStub.select.mockResolvedValueOnce([{ product_id: 1 }, { product_id: 2 }]);

        const result = await query.productsExist(['1', '2']);

        expect(knexStub.whereIn).toHaveBeenCalledWith('product_id', ['1', '2']);

        expect(result).toEqual({ exists: true, notFoundProducts: [] });
    });

    it('should return false and notFoundProducts when some products are missing', async () => {
        knexStub.select.mockResolvedValueOnce([{ product_id: 1 }]);

        const result = await query.productsExist(['1', '2']);

        expect(result).toEqual({ exists: false, notFoundProducts: ['2'] });
    });

    it('shuld return false and all as notFoundProducts when none exist', async () => {
        knexStub.select.mockResolvedValueOnce([]);
        const result = await query.productsExist(['10', '11']);

        expect(result).toEqual({ exists: false, notFoundProducts: ['10', '11'] });
    });

    it('should assign underwriters toapplication', async () => {
        const trxMock = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            update: jest.fn().mockResolvedValue(undefined),
            insert: jest.fn().mockResolvedValue(undefined),
        };
        const trx: any = jest.fn().mockImplementation((table: string) => {
            if (table === 'tasks') return trxMock;
            throw new Error('Unexpected table: ' + table);
        });

        trx.insert = trxMock.insert;

        knexStub.transaction.mockImplementationOnce(async (callback) => {
            await callback(trx);
        });

        await query.assignUnderwritersToApplication(appID, userIDs);

        expect(trxMock.where).toHaveBeenCalledWith('entity', 'omga_items');
        expect(trxMock.andWhere).toHaveBeenCalledWith('item_id', appID);
        expect(trxMock.andWhere).toHaveBeenCalledWith('task_type_id', 3);
        expect(trxMock.andWhere).toHaveBeenCalledWith('task_status_id', 1);
        expect(trxMock.update).toHaveBeenCalledWith({ task_status_id: 5 });

        expect(trxMock.insert).toHaveBeenCalledWith([
            {
                item_id: appID,
                entity_id: appID,
                assigned_to: '123',
                entity: 'omga_items',
                task_status_id: 1,
                task_type_id: 3,
                task_team_id: 5,
            },
            {
                item_id: appID,
                entity_id: appID,
                assigned_to: '321',
                entity: 'omga_items',
                task_status_id: 1,
                task_type_id: 3,
                task_team_id: 5,
            },
        ]);
    });

    it('should unassign all underwriters from application', async () => {
        await query.unassignAllUnderwritersFromApplication(appID);

        expect(knexMock).toHaveBeenCalledWith('tasks');
        expect(knexStub.where).toHaveBeenCalledWith('entity', 'omga_items');
        expect(knexStub.andWhere).toHaveBeenCalledWith('item_id', appID);
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_type_id', 3);
        expect(knexStub.update).toHaveBeenCalledWith({ task_status_id: 5 });
    });

    it('should assign agent to application', async () => {
        await query.assignAgentToApplication(appID, String(userID));

        expect(knexMock).toHaveBeenCalledWith('omga_items');
        expect(knexStub.where).toHaveBeenCalledWith('item_id', appID);
        expect(knexStub.update).toHaveBeenCalledWith({ user_id: String(userID) });
    });

    it('should return agent info by userID', async () => {
        knexStub.first.mockResolvedValue({
            id: mockAgentDto.id,
            firstName: mockAgentDto.firstName,
            lastName: mockAgentDto.lastName,
            email: mockAgentDto.email,
            phone: mockAgentDto.phone,
            agencyPhone: '',
        });

        const result = await query.getAgentInfoByUserId(String(userID));

        expect(knexStub.from).toHaveBeenCalledWith('users as u');
        expect(knexStub.select).toHaveBeenCalled();
        expect(knexStub.leftJoin).toHaveBeenCalledWith('people as p', 'u.person_id', 'p.person_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_agencies as a', 'u.agency_id', 'a.agency_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('companies as c', 'a.company_id', 'c.company_id');
        expect(knexStub.where).toHaveBeenCalledWith('u.user_id', mockAgentDto.id);
        expect(knexStub.first).toHaveBeenCalled();

        expect(result).toEqual(mockAgentDto);
    });

    it('should return user IDs assigned to an application by appID', async () => {
        const mockAssignedUsers = [{ assigned_to: 'user1' }, { assigned_to: 'user2' }];

        knexStub.select.mockImplementationOnce(() => knexStub);
        knexStub.then.mockImplementationOnce((cb: any) =>
            Promise.resolve([{ assigned_to: 'user1' }, { assigned_to: 'user2' }]).then(cb),
        );
        const result = await query.getTaskUserIDsByAppID(appID);

        expect(knexMock).toHaveBeenCalledWith('tasks');
        expect(knexStub.select).toHaveBeenCalledWith('assigned_to');
        expect(knexStub.where).toHaveBeenCalledWith('item_id', appID);
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_type_id', 3);
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_status_id', 1);
        expect(result).toEqual(mockAssignedUsers);
    });

    it('should return item IDs for given userIDs', async () => {
        const mockTasks = [{ item_id: 100 }, { item_id: 200 }];

        knexStub.then.mockImplementationOnce((cb: any) => Promise.resolve(mockTasks).then(cb));
        const result = await query.getTaskByUserIDs(userIDs);

        expect(knexStub.select).toHaveBeenCalledWith('item_id');
        expect(knexStub.whereIn).toHaveBeenCalledWith('assigned_to', userIDs);
        expect(knexStub.andWhere).toHaveBeenCalledWith('entity', 'omga_items');
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_type_id', 3);
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_status_id', 1);
        expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks exist for userIDs', async () => {
        knexStub.then.mockImplementationOnce((cb: any) => Promise.resolve([]).then(cb));
        const result = await query.getTaskByUserIDs(userIDs);

        expect(knexStub.select).toHaveBeenCalledWith('item_id');
        expect(knexStub.whereIn).toHaveBeenCalledWith('assigned_to', userIDs);
        expect(knexStub.andWhere).toHaveBeenCalledWith('entity', 'omga_items');
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_type_id', 3);
        expect(knexStub.andWhere).toHaveBeenCalledWith('task_status_id', 1);
        expect(result).toEqual([]);
    });

    it('should return aditional product data by appID', async () => {
        const mockData = [
            { product_id: 1, item_id: Number(appID), data: 'info1' },
            { product_id: 2, item_id: Number(appID), data: 'info2' },
        ];

        knexStub.select.mockReturnThis();
        knexStub.where.mockResolvedValueOnce(mockData);
        const result = await query.getAdditionalProductDataByAppID(String(appID));

        expect(knexStub.select).toHaveBeenCalledWith('product_id', 'item_id', 'data');
        expect(knexStub.where).toHaveBeenCalledWith('item_id', String(appID));
        expect(result).toEqual(mockData);
    });

    it('should return empty array when no additional product data found', async () => {
        knexStub.select.mockReturnThis();
        knexStub.where.mockResolvedValueOnce([]);
        const result = await query.getAdditionalProductDataByAppID(String(appID));

        expect(knexStub.select).toHaveBeenCalledWith('product_id', 'item_id', 'data');
        expect(knexStub.where).toHaveBeenCalledWith('item_id', String(appID));
        expect(result).toEqual([]);
    });

    it('should return policy number by appID', async () => {
        const mockPolicy = { policy_number: policyNumber };

        knexStub.select.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.first.mockResolvedValueOnce(mockPolicy);

        const result = await query.findPolicyByAppID(String(appID));

        expect(knexStub.select).toHaveBeenCalledWith('policy_number');
        expect(knexStub.where).toHaveBeenCalledWith('item_id', String(appID));
        expect(knexStub.first).toHaveBeenCalled();
        expect(result).toEqual(mockPolicy);
    });

    it('should return undefined when no policy is found by appID', async () => {
        knexStub.select.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.first.mockResolvedValueOnce(undefined);

        const result = await query.findPolicyByAppID(String(appID));

        expect(knexStub.select).toHaveBeenCalledWith('policy_number');
        expect(knexStub.where).toHaveBeenCalledWith('item_id', String(appID));
        expect(knexStub.first).toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should return linked products by appID', async () => {
        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.andWhere.mockResolvedValueOnce(mockLinkedProducts);

        const result = await query.getLinkedProductsByAppID(String(appID));

        expect(knexStub.select).toHaveBeenCalled();
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_products as ops', 'lp.product_id', 'ops.product_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_programs as opg', 'lp.program_id', 'opg.program_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_carriers as oc', 'ops.carrier_id', 'oc.carrier_id');
        expect(knexStub.where).toHaveBeenCalledWith('lp.item_id', String(appID));
        expect(knexStub.andWhere).toHaveBeenCalledWith('lp.active', 1);
        expect(result).toEqual(mockLinkedProducts);
    });

    it('should return empty array when no linked products found by appID', async () => {
        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.andWhere.mockResolvedValueOnce([]);

        const result = await query.getLinkedProductsByAppID(String(appID));

        expect(knexStub.select).toHaveBeenCalled();
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_products as ops', 'lp.product_id', 'ops.product_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_programs as opg', 'lp.program_id', 'opg.program_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_carriers as oc', 'ops.carrier_id', 'oc.carrier_id');
        expect(knexStub.where).toHaveBeenCalledWith('lp.item_id', String(appID));
        expect(knexStub.andWhere).toHaveBeenCalledWith('lp.active', 1);
        expect(result).toEqual([]);
    });

    it('should return amp notes by appID', async () => {
        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.andWhere.mockReturnThis();
        knexStub.then.mockImplementation((cb) => Promise.resolve([mockGetAmpNotesByIDResult]).then(cb));

        const result = await query.getAmpNotesByAppID(appID);

        expect(knexStub.select).toHaveBeenCalled();
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_note_data as nd', 'n.note_id', 'nd.note_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('users as u', 'u.user_id', 'n.user_id');
        expect(knexStub.where).toHaveBeenCalledWith('n.entity_table', 'omga_items');
        expect(knexStub.andWhere).toHaveBeenCalledWith('n.entity_id', appID);
        expect(result).toEqual([mockGetAmpNotesByIDResult]);
    });

    it('should return empty array when no amp notes exist for appID', async () => {
        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.andWhere.mockReturnThis();
        knexStub.then.mockImplementation((cb) => Promise.resolve([]).then(cb));

        const result = await query.getAmpNotesByAppID(appID);

        expect(knexStub.select).toHaveBeenCalled();
        expect(knexStub.leftJoin).toHaveBeenCalledWith('omga_note_data as nd', 'n.note_id', 'nd.note_id');
        expect(knexStub.leftJoin).toHaveBeenCalledWith('users as u', 'u.user_id', 'n.user_id');
        expect(knexStub.where).toHaveBeenCalledWith('n.entity_table', 'omga_items');
        expect(knexStub.andWhere).toHaveBeenCalledWith('n.entity_id', appID);
        expect(result).toEqual([]);
    });
    it('should apply child agency filter when parentAgencyID is provided', async () => {
        jest.setTimeout(10000);
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            parentAgencyID: '999',
        };

        const mockApplications = [];
        const mockAgencies = [{ agency_id: 1 }, { agency_id: 2 }];

        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.whereNot.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.orWhere.mockReturnThis();
        knexStub.whereIn.mockReturnThis();
        knexStub.raw.mockReturnValue('mockRaw');

        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve(mockApplications).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        knexMock.mockImplementation((table: string) => {
            if (table === 'omga_agencies as ag') {
                return {
                    select: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    orWhere: jest.fn().mockReturnThis(),
                    then: jest.fn((cb) => Promise.resolve(mockAgencies).then(cb)),
                };
            }

            return knexStub;
        });

        const result = await query.findAll(filters);

        expect(knexStub.whereIn).toHaveBeenCalledWith('oi.agency_id', [1, 2]);
        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should apply insured_id filter when searchTerm is a string', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            searchTerm: 'CompanyX', // non-numeric to trigger getInsuredIDsByCompanyName
        };

        const mockInsureds = [{ insured_id: 100 }, { insured_id: 200 }];
        const mockApplications = [];
        const mockCount = [{ count: 1 }];

        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.whereNot.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.whereIn.mockReturnThis();
        knexStub.raw.mockReturnValue('mockRaw');

        knexMock.mockImplementation((table: string) => {
            if (table === 'omga_insureds as ois') {
                return {
                    select: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    then: jest.fn((cb) => Promise.resolve(mockInsureds).then(cb)),
                };
            }

            return knexStub;
        }),
            knexStub.then
                .mockImplementationOnce((cb) => Promise.resolve(mockApplications).then(cb))
                .mockImplementationOnce((cb) => Promise.resolve(mockCount).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.whereIn).toHaveBeenCalledWith('oi.insured_id', [100, 200]);
        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should apply effective_date filter when startDate and endDate are provided', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
        };

        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.whereNot.mockReturnThis();
        knexStub.whereRaw.mockReturnThis();
        knexStub.raw.mockReturnValue('mockRaw');

        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.whereRaw).toHaveBeenCalledWith('DATE(oi.effective_date) BETWEEN ? AND ?', [
            '2024-01-01',
            '2024-12-31',
        ]);

        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should apply status filter when statuses are provided', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            statuses: [ApplicationStatusDisplayValueEnum.BOUND],
        };

        const expectedStatusID = ApplicationStatusIDEnum.BOUND;

        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.whereNot.mockReturnThis();
        knexStub.whereIn.mockReturnThis();
        knexStub.raw.mockReturnValue('mockRaw');
        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb)); // totalCount

        const result = await query.findAll(filters);

        expect(knexStub.whereIn).toHaveBeenCalledWith('oi.status_id', [expectedStatusID]);
        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should apply status filter when statuses are provided', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            statuses: [ApplicationStatusDisplayValueEnum.BOUND, ApplicationStatusDisplayValueEnum.IN_PROGRESS],
        };

        knexStub.select.mockReturnThis();
        knexStub.leftJoin.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.whereNot.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.whereIn.mockReturnThis();
        knexStub.raw.mockReturnValue('mockRaw');
        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.whereIn).toHaveBeenCalledWith('oi.status_id', [
            ApplicationStatusIDEnum.BOUND,
            ApplicationStatusIDEnum.IN_PROGRESS,
        ]);
        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should return application by ID', async () => {
        const selectMock = jest.fn().mockReturnThis();
        const whereMock = jest.fn().mockReturnThis();
        const firstMock = jest.fn().mockResolvedValue(mockAmpApplication);

        const queryBuilderMock = {
            select: selectMock,
            where: whereMock,
            first: firstMock,
        };

        jest.spyOn(query as any, 'buildBaseQuery').mockReturnValue(queryBuilderMock);
        jest.spyOn(query as any, 'getSelectFields').mockReturnValue(['oi.item_id', 'oi.name']);

        const result = await query.findOne(appID);

        expect(selectMock).toHaveBeenCalledWith(['oi.item_id', 'oi.name']);
        expect(whereMock).toHaveBeenCalledWith('oi.item_id', appID);
        expect(firstMock).toHaveBeenCalled();
        expect(result).toEqual(mockAmpApplication);
    });

    it('should apply startDate filter when only startDate is provided', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            startDate: '2024-01-01',
        };

        knexStub.select.mockReturnThis();
        knexStub.whereRaw.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.whereRaw).toHaveBeenCalledWith('DATE(oi.effective_date) >= ?', [filters.startDate]);
        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should apply endDate filter when only endDate is provided', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            endDate: '2024-12-31',
        };

        knexStub.select.mockReturnThis();
        knexStub.whereRaw.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.whereRaw).toHaveBeenCalledWith('DATE(oi.effective_date) <= ?', [filters.endDate]);
        expect(result).toEqual({
            applications: [],
            currentPage: 1,
            nextPage: null,
            totalPages: 1,
        });
    });

    it('should apply item_id like filter when searchTerm is a number', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            searchTerm: '123',
        };

        knexStub.select.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.where).toHaveBeenCalledWith('oi.item_id', 'like', '123%');
        expect(result.currentPage).toBe(1);
    });

    it('should apply direct filters for agentIDs, agencyID, productIDs, and states', async () => {
        const filters: FilterParamDto = {
            nextPage: 1,
            pageLimit: 10,
            agentIDs: [agentID],
            agencyID: String(agencyID),
            productIDs: ['product1'],
            states: [UsStatesEnum.CA],
        };

        knexStub.select.mockReturnThis();
        knexStub.where.mockReturnThis();
        knexStub.whereIn.mockReturnThis();
        knexStub.orderBy.mockReturnThis();
        knexStub.limit.mockReturnThis();
        knexStub.offset.mockReturnThis();
        knexStub.then
            .mockImplementationOnce((cb) => Promise.resolve([]).then(cb))
            .mockImplementationOnce((cb) => Promise.resolve([{ count: 1 }]).then(cb));

        const result = await query.findAll(filters);

        expect(knexStub.whereIn).toHaveBeenCalledWith('oi.user_id', filters.agentIDs);
        expect(knexStub.where).toHaveBeenCalledWith('oi.agency_id', filters.agencyID);
        expect(knexStub.whereIn).toHaveBeenCalledWith('oi.product_ids', filters.productIDs);
        expect(knexStub.whereIn).toHaveBeenCalledWith('p.state', filters.states);
        expect(result.currentPage).toBe(1);
    });
});
