export interface GetDriverQueryResult {
    auto_driver_schedule_id: number;
    firstname: string;
    lastname: string;
    dob: string;
    license: string;
}

export interface MvrApiCreditScore {
    status: string;
    appID: string;
    score: number;
    scoreRange: string;
    actionCode: string;
    color: string;
    lastOrderDate: string;
    drivers: MvrApiDriver[];
}

export interface MvrApiCreditScoreRequest {
    appID: string;
    drivers: MvrApiDriver[];
}

export interface MvrApiCreditScoreResponse {
    creditScore: MvrApiCreditScore;
    status?: string;
    warnings?: MvrApiMessage[];
    errors?: MvrApiMessage[];
}

export interface MvrApiDriver {
    firstName: string;
    lastName: string;
    dob: string;
    licenseNum: string;
}

export interface MvrApiMessage {
    code: string;
    description: string;
}
