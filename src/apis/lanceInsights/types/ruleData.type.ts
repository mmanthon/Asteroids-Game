import { RuleDataOperator } from './ruleDataOperator.type';

// Note: this format may only be guaranteed when type = question_check

export type RuleData = {
    field: string;
    value?: string;
    operator?: RuleDataOperator;
};
