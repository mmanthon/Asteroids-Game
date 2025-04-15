/* eslint-disable camelcase */
import {
    ApplicationStatusDisplayValueEnum,
    ApplicationStatusIDEnum,
    ApplicationTypeEnum,
    getKeyFromEnum,
} from '@ignidus/iscx-backend-utils';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { FilterParamDto } from './dto';
import { SortByEnum, SortByMapToDBEnum, SortOrderEnum } from './enums';
import { AmpApplication, FindAllResult, GetAmpNotesByAppIDResult, GetLinkedProductResult } from './interfaces';

@Injectable()
export class ApplicationQuery {
    constructor(@Inject('Amp') private readonly amp: Knex) {}

    /**
     * @description Get application by id
     * @param {string} id
     * @returns {Promise<AmpApplication>}
     */
    async findOne(id: string): Promise<AmpApplication> {
        return this.buildBaseQuery().select('*').where('oi.item_id', id).first();
    }

    /**
     * @description Get all applications
     * @param {FilterParamDto} filters
     * @returns {Promise<AmpApplication[]>}
     */
    async findAll(filters: FilterParamDto): Promise<FindAllResult> {
        const { nextPage = 1, pageLimit = 15 } = filters;

        // Get applications
        const applications = await this.applyPaginationAndSorting(filters);

        // Apply filters to total count query
        const totalCount = await this.getTotalCount(filters);

        // Calculate pagination details
        const totalPages = pageLimit ? Math.ceil(totalCount / pageLimit) : 1;
        const calculatedNextPage = nextPage < totalPages ? nextPage + 1 : null;

        return {
            applications,
            currentPage: nextPage > totalPages ? totalPages : nextPage,
            nextPage: calculatedNextPage,
            totalPages,
        };
    }

    /**
     * @description Check if an agency exists
     * @param {string} agencyID
     * @returns {Promise<boolean>}
     */
    async agencyExists(agencyID: string): Promise<boolean> {
        const agency = await this.amp('omga_agencies ').where('agency_id', agencyID).first();

        return !!agency;
    }

    /**
     * @description Check if an agent exists
     * @param {string} agentID
     * @returns {Promise<boolean>}
     */
    async agentExists(agentID: string): Promise<boolean> {
        const agent = await this.amp('users').where('user_id', agentID).first();

        return !!agent;
    }

    /**
     * @description Check if an application exists
     * @param {string} applicationID
     * @returns {Promise<boolean>}
     */
    async applicationExists(applicationID: string): Promise<boolean> {
        const application = await this.amp('omga_items')
            .whereNot('product_ids', null)
            .where('item_id', applicationID)
            .first();

        return !!application;
    }

    /**
     * @description Check if a products exists
     * @param {string[]} productIDs
     * @returns {Promise<boolean>}
     */
    async productsExist(productIDs: string[]): Promise<{ exists: boolean; notFoundProducts: string[] }> {
        if (!productIDs || productIDs.length === 0) return { exists: false, notFoundProducts: [] };

        const products = await this.amp('omga_products').whereIn('product_id', productIDs).select('product_id');

        const foundProductIDs = products.map((product) => product.product_id);
        const notFoundProducts = productIDs.filter((id) => !foundProductIDs.includes(Number(id)));

        return {
            exists: notFoundProducts.length === 0,
            notFoundProducts,
        };
    }

    /**
     * @description Assign underwriters to application
     * @param {string} id
     * @param {string[]} userIDs
     * @returns {Promise<void>}
     */
    async assignUnderwritersToApplication(id: string, userIDs: string[]): Promise<void> {
        await this.amp.transaction(async (trx) => {
            await trx('tasks')
                .where('entity', 'omga_items')
                .andWhere('item_id', id)
                .andWhere('task_type_id', 3)
                .andWhere('task_status_id', 1)
                .update({ task_status_id: 5 });

            const newTasks = userIDs.map((userID) => ({
                item_id: id,
                entity_id: id,
                assigned_to: userID,
                entity: 'omga_items',
                task_status_id: 1,
                task_type_id: 3,
                task_team_id: 5,
            }));

            await trx('tasks').insert(newTasks);
        });
    }

    /**
     * @description Unassign all underwriters from application
     * @param {string} id
     * @returns {Promise<void>}
     */
    async unassignAllUnderwritersFromApplication(id: string): Promise<void> {
        await this.amp('tasks')
            .where('entity', 'omga_items')
            .andWhere('item_id', id)
            .andWhere('task_type_id', 3)
            .update({ task_status_id: 5 });
    }

    /**
     * @description Assign agent to application
     * @param {string} id
     * @param {string} agentID
     * @returns {Promise<void>}
     */
    async assignAgentToApplication(id: string, agentID: string): Promise<void> {
        await this.amp('omga_items').where('item_id', id).update({ user_id: agentID });
    }

    /**
     * @description Get task assigned user by id
     * @param {string} id
     * @returns {Promise<{ assigned_to: string }[]>}
     */
    getTaskUserIDsByAppID(id: string): Promise<{ assigned_to: string }[]> {
        return this.amp('tasks')
            .select('assigned_to')
            .where('item_id', id)
            .andWhere('entity', 'omga_items')
            .andWhere('task_type_id', 3)
            .andWhere('task_status_id', 1);
    }

    /**
     * @description Get task by userIDs
     * @param {string[]} userIDs
     * @returns {Promise<{ item_id: number }[]>}
     */
    getTaskByUserIDs(userIDs: string[]): Promise<{ item_id: number }[]> {
        return this.amp('tasks')
            .select('item_id')
            .whereIn('assigned_to', userIDs)
            .andWhere('entity', 'omga_items')
            .andWhere('task_type_id', 3)
            .andWhere('task_status_id', 1);
    }

    /**
     * @description Get additional product data by appID
     * @param {string} id
     * @returns {Promise<{ product_id: number; item_id: number; data: string }[]>}
     */
    getAdditionalProductDataByAppID(id: string): Promise<{ product_id: number; item_id: number; data: string }[]> {
        return this.amp('omga_additional_product_data').select('product_id', 'item_id', 'data').where('item_id', id);
    }

    /**
     * @description Find policy by appID
     * @param {string} id
     * @returns {Promise<policy_number>}
     */
    findPolicyByAppID(id: string): Promise<{ policy_number: string }> {
        return this.amp('omga_policies').select('policy_number').where('item_id', id).first();
    }

    /**
     * @description Get linked products by appID
     * @param {string} id
     */
    getLinkedProductsByAppID(id: string): Promise<GetLinkedProductResult[]> {
        return this.amp('omga_item_linked_products as lp')
            .select(
                'lp.product_id',
                'ops.name as product_name',
                'opg.program_type_id',
                'opg.program_id',
                'oc.name as carrier_name',
            )
            .leftJoin('omga_products as ops', 'lp.product_id', 'ops.product_id')
            .leftJoin('omga_programs as opg', 'lp.program_id', 'opg.program_id')
            .leftJoin('omga_carriers as oc', 'ops.carrier_id', 'oc.carrier_id')
            .where('lp.item_id', id)
            .andWhere('lp.active', 1);
    }

    /**
     * @description Get notes by appID
     * @param {string} id
     * @returns {Promise<GetAmpNotesByAppIDResult[]>}
     */
    async getAmpNotesByAppID(id: string): Promise<GetAmpNotesByAppIDResult[]> {
        return this.amp('notes as n')
            .select(
                'n.note_id',
                'n.user_id',
                'u.first_name',
                'u.last_name',
                'n.written',
                'n.note',
                'n.entry_status',
                'n.parent_note_id',
                'nd.sent_to_producer',
                'nd.sent_to_underwriter',
            )
            .leftJoin('omga_note_data as nd', 'n.note_id', 'nd.note_id')
            .leftJoin('users as u', 'u.user_id', 'n.user_id')
            .where('n.entity_table', 'omga_items')
            .andWhere('n.entity_id', id);
    }

    /**
     * @description Get child agencies
     * @param {string} agencyID
     * @returns {Promise<{ agency_id: number }[]>}
     */
    private getChildAgency(agencyID: string): Promise<{ agency_id: number }[]> {
        return this.amp('omga_agencies as ag')
            .select('ag.agency_id')
            .where('ag.parent_agency_id', agencyID)
            .orWhere('ag.agency_id', agencyID);
    }

    /**
     * @description Get insured IDs by company name
     * @param {string} companyName
     * @returns {Promise<{ insured_id: number }[]>}
     */
    private getInsuredIDsByCompanyName(companyName: string): Promise<{ insured_id: number }[]> {
        return this.amp('omga_insureds as ois')
            .select('ois.insured_id')
            .where('ois.company_name', 'like', `${companyName}%`);
    }

    /**
     * @description Apply pagination and sorting
     * @param {FilterParamDto} filters
     * @returns {Knex.QueryBuilder}
     */
    private async applyPaginationAndSorting(filters: FilterParamDto): Promise<AmpApplication[]> {
        const { nextPage = 1, pageLimit = 15, sortBy = SortByEnum.APP_ID, sortOrder = SortOrderEnum.DESC } = filters;
        const baseQuery = this.buildBaseQuery()
            .select(this.getSelectFields())
            .orderBy(SortByMapToDBEnum[getKeyFromEnum(sortBy, SortByEnum)], sortOrder)
            .limit(pageLimit)
            .offset((nextPage - 1) * pageLimit);

        await this.applyFilters(baseQuery, filters);

        return baseQuery;
    }

    /**
     * @description Get total count of applications
     * @param {FilterParamDto} filters
     * @returns {Promise<number>}
     */
    private async getTotalCount(filters: FilterParamDto): Promise<number> {
        const query = this.amp('omga_items as oi')
            .count('oi.item_id as count')
            .leftJoin('omga_insureds as ois', 'oi.insured_id', 'ois.insured_id')
            .leftJoin('people as p', 'ois.person_id', 'p.person_id')
            .whereNot('oi.product_ids', null)
            .where(
                this.amp.raw(`
                (YEAR(oi.created) = YEAR(CURDATE()) 
                OR (YEAR(oi.created) = YEAR(CURDATE()) - 1 AND MONTH(oi.created) BETWEEN 7 AND 12))
              `),
            );

        await this.applyFilters(query, filters);

        const [totalCountResult] = await query;

        return totalCountResult ? parseInt(String(totalCountResult.count), 10) : 0;
    }

    /**
     * @description Build base query
     * @returns {Knex.QueryBuilder}
     */
    private buildBaseQuery(): Knex.QueryBuilder {
        return this.amp('omga_items as oi')
            .leftJoin('omga_agencies as oa', 'oi.agency_id', 'oa.agency_id')
            .leftJoin('companies as c', 'oa.company_id', 'c.company_id')
            .leftJoin('omga_insureds as ois', 'oi.insured_id', 'ois.insured_id')
            .leftJoin('omga_products as ops', 'oi.product_ids', 'ops.product_id')
            .leftJoin('omga_carriers as oc', 'ops.carrier_id', 'oc.carrier_id')
            .leftJoin('omga_statuses as os', 'oi.status_id', 'os.status_id')
            .leftJoin('people as p', 'ois.person_id', 'p.person_id')
            .leftJoin('users as u', 'oi.user_id', 'u.user_id')
            .leftJoin('omga_programs as opg', 'oi.program_id', 'opg.program_id')
            .leftJoin('omga_exposure_data as oed', 'oi.exposure_data_id', 'oed.exposure_data_id')
            .leftJoin('omga_linked_items as oli', 'oi.item_id', 'oli.item_id')
            .leftJoin(
                this.amp('omga_item_status_history as ish1')
                    .select('ish1.item_id', 'ish1.item_status_history_id', 'ish1.changed')
                    .whereRaw(
                        'ish1.item_status_history_id = (SELECT MAX(ish2.item_status_history_id) FROM omga_item_status_history as ish2 WHERE ish2.item_id = ish1.item_id)',
                    )
                    .as('ish'),
                'oi.item_id',
                'ish.item_id',
            )
            .whereNot('oi.product_ids', null)
            .where(
                this.amp.raw(`
                (YEAR(oi.created) = YEAR(CURDATE()) 
                OR (YEAR(oi.created) = YEAR(CURDATE()) - 1 AND MONTH(oi.created) BETWEEN 7 AND 12))
              `),
            );
    }

    /**
     * @description Get select fields
     * @returns {string[]}
     */
    private getSelectFields(): string[] {
        return [
            'oi.item_id',
            'oi.created_from_renewal',
            'oi.user_id',
            'oi.last_updated',
            'oi.created',
            'oi.effective_date',
            'oi.total_cost',
            'oi.program_id',
            'oi.product_ids',
            'oi.first_bound_date',
            'c.name as agency_name',
            'p.first as insured_first_name',
            'p.last as insured_last_name',
            'p.phone as insured_phone',
            'p.email as insured_email',
            'p.physical_address as insured_address',
            'p.physical_city as insured_city',
            'p.physical_state as insured_state',
            'p.physical_zip as insured_zip',
            'ois.company_name as insured_company_name',
            'ops.name as product_name',
            'oc.name as carrier_name',
            'os.name as status_name',
            'u.first_name as user_first_name',
            'u.last_name as user_last_name',
            'opg.program_type_id',
            'oed.project_end_date',
            'oli.group_id',
            'ish.changed as last_status_update',
        ];
    }

    /**
     * @description Handle filters
     * @param {Knex.QueryBuilder} query
     * @param {FilterParamDto} filters
     * @returns {Promise<void>}
     */
    private async applyFilters(query: Knex.QueryBuilder, filters: FilterParamDto): Promise<void> {
        const {
            agencyID,
            parentAgencyID,
            productIDs,
            agentIDs,
            statuses,
            assignedUWIDs,
            searchTerm,
            type,
            startDate,
            endDate,
            states,
        } = filters;

        // Apply simple filters directly
        if (agentIDs) query.whereIn('oi.user_id', agentIDs);
        if (agencyID) query.where('oi.agency_id', agencyID);
        if (productIDs) query.whereIn('oi.product_ids', productIDs);
        if (states) query.whereIn('p.state', states);

        // Collect async operations
        const asyncOperations = [];

        // Fetch child agencies if parentAgencyID is provided
        if (parentAgencyID) {
            asyncOperations.push(
                this.getChildAgency(parentAgencyID).then((childAgencies) => {
                    query.whereIn(
                        'oi.agency_id',
                        childAgencies.map(({ agency_id }) => agency_id),
                    );
                }),
            );
        }

        // Apply application type filter
        if (type) query.where('oi.created_from_renewal', type === ApplicationTypeEnum.NEW ? 0 : 1);

        // Apply date filters
        if (startDate && endDate) {
            query.whereRaw('DATE(oi.effective_date) BETWEEN ? AND ?', [startDate, endDate]);
        } else {
            if (startDate) query.whereRaw('DATE(oi.effective_date) >= ?', [startDate]);
            if (endDate) query.whereRaw('DATE(oi.effective_date) <= ?', [endDate]);
        }

        // Map statuses to IDs and apply filter
        if (statuses) {
            const statusIDs = statuses.map(
                (status) => ApplicationStatusIDEnum[getKeyFromEnum(status, ApplicationStatusDisplayValueEnum)],
            );

            query.whereIn('oi.status_id', statusIDs);
        }

        // Fetch task items if assignedUWIDs are provided
        if (assignedUWIDs) {
            asyncOperations.push(
                this.getTaskByUserIDs(assignedUWIDs).then((taskItemIDs) => {
                    query.whereIn(
                        'oi.item_id',
                        taskItemIDs.map((task) => task.item_id),
                    );
                }),
            );
        }

        // Handle search term, distinguishing between numeric and non-numeric cases
        if (searchTerm) {
            if (isNaN(Number(searchTerm))) {
                asyncOperations.push(
                    this.getInsuredIDsByCompanyName(searchTerm).then((insuredIDs) => {
                        query.whereIn(
                            'oi.insured_id',
                            insuredIDs.map(({ insured_id }) => insured_id),
                        );
                    }),
                );
            } else {
                query.where('oi.item_id', 'like', `${searchTerm}%`);
            }
        }

        await Promise.all(asyncOperations);
    }
}
