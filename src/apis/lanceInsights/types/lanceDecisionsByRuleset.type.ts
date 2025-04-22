import { LanceDecision } from './lanceDecision.type';
import { RulesetID } from './types.type';

export type LanceDecisionsByRuleset = {
    [key: RulesetID]: LanceDecision;
};
