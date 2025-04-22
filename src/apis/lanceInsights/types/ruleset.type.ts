import { RuleData } from './ruleData.type';
import { RuleType } from './ruleType.type';

export type ProductRules = Ruleset;
export type Ruleset = {
    ruleID: string;
    data: RuleData;
    error: string;
    sequence: number;
    type: RuleType;
}[];
