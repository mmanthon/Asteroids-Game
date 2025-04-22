import { OneOrZero } from './types.type';

export type ApprovalHistoryQueryResults = {
    history_id: number;
    item_id: string;
    ruleset_id: number;
    decision: OneOrZero;
    created: Date;
}[];
