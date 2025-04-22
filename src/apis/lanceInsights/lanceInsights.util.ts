/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common';

import { LanceInsightProductDto, LanceInsightRulesDto, LanceInsightsResponseDto } from './dto';
import { AutoApprovalFailureReasonsEnum, LanceStatusEnum, RuleDataOperatorEnum } from './enums';
import { LanceInsightsQuery } from './lanceInsights.query';
import {
    ApprovalRuleQueryResults,
    Note,
    ProductCarrierMap,
    ProductRules,
    RuleData,
    RulesByRulesetByProduct,
} from './types';

@Injectable()
export class LanceInsightsUtil {
    constructor(private readonly lanceInsightsQuery: LanceInsightsQuery) {}

    /**
     * @description process approved lance runs and return the results
     * @param {string} appID
     * @param {string[]} productIDs
     * @returns {Promise<LanceInsightsResponseDto[]>}
     */
    async processApprovedRuns(appID: string, productIDs: string[]): Promise<LanceInsightsResponseDto[]> {
        const results: LanceInsightsResponseDto[] = [];

        // get approved lance runs and then create a array of ruleset ids
        const approvedRuns = await this.lanceInsightsQuery.findApprovedLanceRuns(appID);
        const ruleSetIds = approvedRuns.map((run) => run.ruleset_id);

        // create rules by product and ruleset object
        const rulesByProductByRuleset = await this.createRulesetByProductMap(ruleSetIds, productIDs);

        // create product carrier map
        const productCarrierMap = await this.createProductCarrierMap(productIDs);

        for (const approved of approvedRuns) {
            const products = await this.createAll(rulesByProductByRuleset, LanceStatusEnum.PASS, productCarrierMap);

            results.push({ appID, status: LanceStatusEnum.PASS, timestamp: approved.created.toISOString(), products });
        }

        return results;
    }

    /**
     * @description process failed lance runs and return the results
     * @param {string} appID
     * @returns {Promise<LanceInsightsResponseDto[]>}
     */
    async processFailedRuns(appID: string, productIDs: string[]): Promise<LanceInsightsResponseDto[]> {
        let results: LanceInsightsResponseDto[] = [];

        const notes = await this.lanceInsightsQuery.findLanceNotes(appID);

        const failureReasonsSet = new Set([
            AutoApprovalFailureReasonsEnum.FOURPOWERUNIT,
            AutoApprovalFailureReasonsEnum.TENPOWERUNIT,
        ]);
        const specialCase = notes.some(({ note }) => [...failureReasonsSet].some((reason) => note.includes(reason)));

        if (specialCase) {
            // build the results with the special case note in the failed products array
            results = await this.buildFailedProductResults(appID, productIDs, notes);

            return results;
        }

        // get failed lance run products and then create a array of product ids
        const failedLanceRunProducts = await this.lanceInsightsQuery.findFailedLanceRunProducts(appID);
        const failedLanceRunProductIDs = failedLanceRunProducts.map((product) => String(product.product_id));

        results = await this.buildFailedProductResults(appID, failedLanceRunProductIDs, notes);

        return results;
    }

    /**
     * @description create application productID array
     * @param {string} appID - application id
     * @returns {string[]} - product ids as an array of strings
     */
    async createApplicationProductIDArray(appID: string): Promise<string[]> {
        const application = await this.lanceInsightsQuery.findApplication(appID);
        const linkedProducts = await this.lanceInsightsQuery.findLinkedProducts(appID);

        return [application.product_ids, ...linkedProducts.map((linkedProduct) => linkedProduct.product_id)];
    }

    /**
     * @description map the results into product response format
     * @param {RulesByRulesetByProduct} rules
     * @param {LanceStatusEnum} decision
     * @param {ProductCarrierMap} productCarrierMap
     * @param {string} note [optional]
     * @returns {Promise<LanceInsightProductDto[]>}
     */
    private async createAll(
        rules: RulesByRulesetByProduct,
        decision: LanceStatusEnum,
        productCarrierMap: ProductCarrierMap,
        note?: string,
    ): Promise<LanceInsightProductDto[]> {
        const products = await Promise.all(
            Object.entries(rules).map(async ([productID, rulesets]) => {
                const productRules = this.formatProductRules(Object.values(rulesets).flat(), note);

                return {
                    productID,
                    status: decision,
                    carrierName: productCarrierMap[productID] || '',
                    rules: productRules,
                };
            }),
        );

        return products;
    }

    /**
     * @description build failed product results
     * @param {string} appID
     * @param {string[]} productIDs
     * @returns {Promise<LanceInsightsResponseDto[]>}
     */
    private async buildFailedProductResults(
        appID: string,
        productIDs: string[],
        notes: Note[],
    ): Promise<LanceInsightsResponseDto[]> {
        const results = [];

        // get latest failed lance runs and then create a array of ruleset ids
        const latestFailedLanceRuns = await this.lanceInsightsQuery.findLatestFailedLanceRun(appID);
        const ruleSetIds = latestFailedLanceRuns.map((run) => run.ruleset_id);

        const rulesByProductByRuleset = await this.createRulesetByProductMap(ruleSetIds, productIDs);

        // create product carrier map
        const productCarrierMap = await this.createProductCarrierMap(productIDs);

        for (const note of notes) {
            const products = await this.createAll(
                rulesByProductByRuleset,
                LanceStatusEnum.FAIL,
                productCarrierMap,
                note.note,
            );

            results.push({
                appID,
                status: LanceStatusEnum.FAIL,
                timestamp: note.written.toISOString(),
                products,
            });
        }

        return results;
    }

    /**
     * @description create ruleset by product map
     * @param {number[]} rulesetIDs - ruleset ids as an array of numbers
     * @param {string[]} productIDs - product ids as an array of strings
     * @returns {RulesByRulesetByProduct} - rules by ruleset by product map
     */
    private async createRulesetByProductMap(
        rulesetIDs: number[],
        productIDs: string[],
    ): Promise<RulesByRulesetByProduct> {
        const rulesets = await this.lanceInsightsQuery.findApprovalRules(rulesetIDs);
        const rulesByProductByRuleset = this.accumulateRulesByProductAndRuleset(productIDs, rulesets);

        return rulesByProductByRuleset;
    }

    /**
     * @description create product carrier map
     * @param {string[]} productIDs - product ids as an array of strings
     * @returns {ProductCarrierMap} - product carrier map
     */
    private async createProductCarrierMap(productIDs: string[]): Promise<ProductCarrierMap> {
        const productCarrierMap: ProductCarrierMap = {};

        for (const productID of productIDs) {
            const carrierName: string = await this.lanceInsightsQuery.findCarrierNameByProductID(productID);

            productCarrierMap[productID] = carrierName;
        }

        return productCarrierMap;
    }

    /**
     * @description accumulate rules by product and ruleset
     * @param {ApprovalRuleQueryResults} lanceProductIDs
     * @param {ApprovalRuleQueryResults} ruleSets
     * @returns {RulesByRulesetByProduct}
     */
    private accumulateRulesByProductAndRuleset(
        lanceProductIDs: string[],
        ruleSets: ApprovalRuleQueryResults,
    ): RulesByRulesetByProduct {
        return lanceProductIDs.reduce((accumulator, productID) => {
            ruleSets.forEach((ruleset) => {
                const { ruleset_id, rule_id } = ruleset;

                // Initialize product_id and ruleset_id in the accumulator if they don't exist
                if (!accumulator[productID]) accumulator[productID] = {};
                if (!accumulator[productID][ruleset_id]) accumulator[productID][ruleset_id] = [];

                // Push the ruleset (with rule_id) to the corresponding product and ruleset
                accumulator[productID][ruleset_id].push({ ruleID: rule_id, ...ruleset });
            });

            return accumulator;
        }, {});
    }

    /**
     * @description build the result for a product decision, sort the rules by pass/fail
     * @param {ProductRules} rules all of the rules for a product on the application
     * @param {Note} note Lance notes related to the application
     * @returns {LanceInsightResultDto}
     */
    private formatProductRules(rules: ProductRules, note?: string): LanceInsightRulesDto {
        const initialResult = { pass: [], fail: [] };

        const failureReasons = [
            AutoApprovalFailureReasonsEnum.FOURPOWERUNIT,
            AutoApprovalFailureReasonsEnum.TENPOWERUNIT,
        ];

        if (note) {
            const matchedReasons = failureReasons.filter((reason) => note.includes(reason));

            initialResult.fail.push(...matchedReasons.map((reason) => ({ label: reason, sequence: 0 })));
        }

        return rules.reduce((result, { error, sequence, data, type }) => {
            let label: string;

            if (error) {
                const ruleError = note?.includes(error);
                const passOrFail = ruleError ? LanceStatusEnum.FAIL : LanceStatusEnum.PASS;

                label = this.formatRuleLabel(type, data, error);

                result[passOrFail].push({ label, sequence });
            }

            return result;
        }, initialResult);
    }

    /**
     * @description format the rule label based on the rule type
     * @param {string} type
     * @param {RuleData} data
     * @param {string} error
     * @returns {string}
     */
    private formatRuleLabel(type: string, data: RuleData, error: string): string {
        let label: string;

        switch (type) {
            case 'question_check':
                label = this.formatQuestionCheckRuleLabel(data);
                break;
            case 'cab_data_factors':
                label = this.formatCabDataRuleLabel(data);
                break;
            case 'iss_score':
                label = this.formatISSScoreLabel(data);
                break;
            case 'dot_rating':
                label = 'DOT Rating must be approved';
                break;
            case 'endorsement_check':
                label = this.formatEndorsementCheckLabel(data);
                break;
            case 'classcode_check':
                label = this.formatClassCodeCheckLabel(data);
                break;
            case 'classcode_name_check':
                label = this.formatClassCodeCheckLabel(data);
                break;
            case 'dissallow_all_classcodes_not_explicitly_allowed':
                label = 'The application must not include disallowed class codes';
                break;
            case 'check_classcode_max':
                label = 'The application must not exceed the aggregate maximum';
                break;
            case 'check_classcode_min':
                label = 'The application must not be below the aggregate minimum';
                break;
            default:
                label = error;
                break;
        }

        return label;
    }

    /**
     * @description format the error message template using the rule data
     * @param {RuleData} data
     * @returns {string}
     */
    private formatQuestionCheckRuleLabel({ field, operator, value }: RuleData): string {
        const valueIsNumerical = !Number.isNaN(Number(value));
        const formattedValue = valueIsNumerical ? value : `${value}`;
        const formattedOperator = RuleDataOperatorEnum[operator] || operator;
        const formattedField = this.formatFieldName(field);

        return `Check answer to ${formattedField}: must be ${formattedOperator} ${formattedValue} for auto-approval`;
    }

    /**
     * @description format the error message template for cab_data_factors using the rule data
     * @param {RuleData} data
     * @returns {string}
     */
    private formatCabDataRuleLabel({ field, operator, value }: RuleData): string {
        const formattedOperator = RuleDataOperatorEnum[operator] || operator;
        const formattedField = this.formatFieldName(field);

        return `${formattedField} must be ${formattedOperator} ${value}`;
    }

    /**
     * @description format the error message template for ISS Score using the rule data
     * @param {RuleData} data
     * @returns {string}
     */
    private formatISSScoreLabel({ operator, value }: RuleData): string {
        const formattedOperator = RuleDataOperatorEnum[operator] || operator;

        return `ISS Score must be ${formattedOperator} ${value}`;
    }

    /**
     * @description format the error message template for endorsement check using the rule data
     * @param {RuleData} data
     * @returns {string}
     */

    private formatEndorsementCheckLabel({ field, operator, value }: RuleData): string {
        const formattedOperator = RuleDataOperatorEnum[operator] || operator;
        const formattedField = this.formatFieldName(field);

        return `${formattedField} ${formattedOperator} ${value}`;
    }

    /**
     * @description format the error message template for classcode check using the rule data
     * @param param
     * @returns {string}
     */
    formatClassCodeCheckLabel({ field, operator, value }: RuleData): string {
        const formattedOperator = RuleDataOperatorEnum[operator] || operator;
        const formattedField = this.formatFieldName(field);

        return `${formattedField} must be ${formattedOperator} ${value}`;
    }

    /**
     * @description format the field name
     * @param {string} field
     * @returns {string}
     */
    private formatFieldName(field: string): string {
        return field
            .split('_')
            .map(([firstLetter, ...word]: string) => `${firstLetter.toUpperCase()}${word.join('')}`)
            .join(' ');
    }
}
