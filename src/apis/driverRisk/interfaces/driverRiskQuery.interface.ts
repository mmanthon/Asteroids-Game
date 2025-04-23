import { AmpDriver } from '../../../shared/interfaces';

export interface EndorsementDriver extends AmpDriver {
    application_endorsement_id: string;
    status_name: string;
    created: string;
    endorsed_at?: string;
}

export interface GetEndorsementQueryResult {
    application_endorsement_id: string;
    data: string;
    encryption_key: string;
    status_name: string;
    created: string;
    endorsed_at: string;
}
