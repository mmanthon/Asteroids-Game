import { RulesByRuleset } from './rulesByRuleset.type';
import { ProductID } from './types.type';

export type RulesByRulesetByProduct = {
    [key: ProductID]: RulesByRuleset;
};
