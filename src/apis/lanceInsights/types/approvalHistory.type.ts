import { LanceStatusEnum } from '../enums';

export type ApprovalHistory = {
    rulesetID: string;
    decision: LanceStatusEnum;
    created: Date;
}[];
