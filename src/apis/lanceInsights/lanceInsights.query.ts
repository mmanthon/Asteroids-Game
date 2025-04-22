/* eslint-disable camelcase */
import { QueryException } from '@ignidus/iscx-backend-utils';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import {
    ApplicationQueryResult,
    ApprovalHistoryQueryResults,
    ApprovalRuleQueryResults,
    CarrierNameQueryResult,
    FailedLanceRunsQueryResults,
    LinkedProductsQueryResults,
    Note,
} from './types';

@Injectable()
export class LanceInsightsQuery {
    constructor(@Inject('Amp') private readonly amp: Knex, @Inject('TrackingDB') private readonly tracking: Knex) {}

    /**
     * @description get application productIDs
     * @param {string} appID
     * @returns {Promise<ApplicationQueryResult>}
     */
    findApplication(appID: string): Promise<ApplicationQueryResult> {
        return this.amp.select('product_ids').from('omga_items').where('item_id', appID).first();
    }

    /**
     * @description find linked products
     * @param {string} appID
     * @returns {Promise<LinkedProductsQueryResults>}
     */
    findLinkedProducts(appID: string): Promise<LinkedProductsQueryResults> {
        return this.amp
            .select('product_id')
            .from('omga_item_linked_products')
            .where('item_id', appID)
            .andWhere('active', 1);
    }

    /**
     * @description find carrier name by productID
     * @param {string} productID
     * @returns {Promise<string>}
     */
    async findCarrierNameByProductID(productID: string): Promise<string> {
        const result: CarrierNameQueryResult = await this.amp
            .select('omga_carriers.name')
            .from('omga_products')
            .innerJoin('omga_carriers', 'omga_products.carrier_id', 'omga_carriers.carrier_id')
            .where('omga_products.product_id', productID)
            .first();

        if (!result) {
            throw new QueryException('Carrier name not found');
        }

        return result.name;
    }

    /**
     * @description find all lance failed rules for the application
     * @param {number[]} rulesetIDs
     * @returns {Promise<ApprovalRuleQueryResults>}
     */
    findApprovalRules(rulesetIDs: number[]): Promise<ApprovalRuleQueryResults> {
        return this.amp
            .select('rule.rule_id', 'rule.error', 'rule.data', 'rule.type', 'ruleset.sequence', 'ruleset.ruleset_id')
            .from('omga_approval_ruleset as ruleset')
            .innerJoin('omga_approval_rules as rule', 'ruleset.rule_id', 'rule.rule_id')
            .andWhere('ruleset.ruleset_id', 'in', rulesetIDs);
    }

    /**
     * @description find all Lance decision notes related to an application
     * @param {string} appID
     * @returns {Promise<Note[]>}
     */
    findLanceNotes(appID: string): Promise<Note[]> {
        return this.amp
            .select('note', 'written')
            .from('notes')
            .where('entity_table', '=', 'omga_items')
            .andWhere('entity_id', '=', appID)
            .andWhere('note', 'like', '%Auto Approval denied%');
    }

    /**
     * @description get all approved runs for the application from tracking DB
     * @param {string} appID
     * @returns {Promise<ApprovalHistoryQueryResults>}
     */
    findApprovedLanceRuns(appID: string): Promise<ApprovalHistoryQueryResults> {
        return this.tracking.select('*').from('omga_approval_history as ah').where({
            'ah.item_id': appID,
            'ah.decision': 1,
        });
    }

    /**
     * @description get products that failed lance run for the application from tracking DB
     * @param {string} appID
     * @returns {Promise<FailedLanceRunsQueryResults>}
     */
    findFailedLanceRunProducts(appID: string): Promise<FailedLanceRunsQueryResults> {
        return this.tracking
            .select('ahr.product_id')
            .from('omga_approval_history as ah')
            .join('omga_approval_rule_history as ahr', 'ahr.history_id', '=', 'ah.history_id')
            .where('ah.item_id', appID)
            .groupBy('ahr.product_id');
    }

    /**
     * @description get the latest failed run for the application from tracking DB
     * @param {string} appID
     * @returns {Promise<ApprovalHistoryQueryResults>}
     */
    async findLatestFailedLanceRun(appID: string): Promise<ApprovalHistoryQueryResults> {
        const subquery = this.tracking
            .select('ruleset_id')
            .from('omga_approval_history')
            .max('created as MaxCreated')
            .where({
                item_id: appID,
                decision: 0,
            })
            .groupBy('ruleset_id')
            .as('latest_ah');

        const result = await this.tracking('omga_approval_history as ah')
            .select('ah.*')
            .from('omga_approval_history as ah')
            .join(subquery, function () {
                this.on('ah.ruleset_id', '=', 'latest_ah.ruleset_id').andOn('ah.created', '=', 'latest_ah.MaxCreated');
            })
            .where({
                'ah.item_id': appID,
                'ah.decision': 0,
            })
            .orderBy('ah.created', 'desc');

        return result;
    }
}
