/* eslint-disable camelcase */
import { ApprovalRuleQueryResults } from '../types';
import { mockRuleData } from './ruleData.type.mock';

export const mockApprovalRuleQueryResults: ApprovalRuleQueryResults = [
    {
        data: mockRuleData,
        error: 'Check answer to Accidents: must be be equal to none for auto-approval',
        ruleset_id: 1,
        rule_id: 101,
        sequence: 1,
        type: 'question_check',
    },
];
