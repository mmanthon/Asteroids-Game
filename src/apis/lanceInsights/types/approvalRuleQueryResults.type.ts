import { RuleData } from './ruleData.type';
import { RuleType } from './ruleType.type';

export type ApprovalRuleQueryResults = {
    data: RuleData;
    error: string;
    ruleset_id: number;
    rule_id: number;
    sequence: number;
    type: RuleType;
}[];
