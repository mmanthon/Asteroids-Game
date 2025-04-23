export interface DecryptedEndorsement {
    addedDrivers?: {
        new?: NewEndorsementDriver[];
    };
    removedDrivers?: {
        new?: NewEndorsementDriver[];
    };
}

export interface NewEndorsementDriver {
    schedule_type: string;
    action: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    dob?: string;
    license?: string;
    state?: string;
}
