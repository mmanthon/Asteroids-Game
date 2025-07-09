import { LanceInsightRulesDto } from '../dto';

export const mockLanceInsightRulesDto: LanceInsightRulesDto = {
    pass: [
        {
            label: 'Check answer to Accidents: must be be equal to none for auto-approval',
            sequence: 1,
        },
    ],
    fail: [],
};

export const mockLanceInsightRulesDtoFail: LanceInsightRulesDto = {
    pass: [],
    fail: [
        {
            label: 'Check that all drivers have no accidents',
            sequence: 500,
        },
    ],
};
