export interface ITransitionMvrDriverWithFirstAndLastName extends MvrBaseDriver {
    firstName: string;
    lastName: string;
}

export interface ITransitionMvrDriverWithFullName extends MvrBaseDriver {
    fullName: string;
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

export interface MvrBaseDriver {
    licenseState: string;
    dob: string;
    licenseNum: string;
}

export type MvrDriverRisk = ITransitionMvrDriverWithFullName | ITransitionMvrDriverWithFirstAndLastName;

export interface MvrDriverRiskAction {
    code?: string | null;
    type?: string | null;
    source?: string | null;
    mailDate?: string | null;
    commercial?: boolean | null;
    incidentDate?: string | null;
    orderedDate?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    thruDate?: string | null;
    thruStatus?: string | null;
    actualEndDate?: string | null;
    message?: string | null;
}

export interface MvrDriverRiskRequest {
    drivers: MvrDriverRisk[];
}
export interface MvrDriverRiskResponse {
    driverFound: boolean;
    firstName: string;
    lastName: string;
    fullName: string;
    dob: string;
    licenseEffectiveDate: string;
    commLicenseEffectiveDate: string;
    licenseExpirationDate: string;
    licenseState: string;
    licenseNum: string;
    licenseType: string;
    isVerified: boolean;
    isRenewed: boolean;
    totalViolationCount: number;
    totalAccidentCount: number;
    totalMajorCount: number;
    totalMinorCount: number;
    totalMajorGuiltyCount: number;
    totalMinorGuiltyCount: number;
    totalMovingGuiltyCount: number;
    totalNonMovingGuiltyCount: number;
    lookBackEndDate: string;
    lookBackStartDate: string;
    medicalIssuedDate: string;
    latestRunDate: string;
    latestCallStatus: string;
    updated: string;
    errors: MvrApiMessage[];
    actions: MvrDriverRiskAction[];
    violations: MvrDriverRiskViolation[];
}

export interface MvrDriverRiskViolation {
    type: string;
    violationDate: string;
    description: string;
    vehicleType: string;
    disposition: string;
    severity: string;
    adjudicatedDate: string;
    adjudicatedDescription: string;
    state: string;
    evcCode: string;
    source: string;
    isMoving: boolean;
    isActionRestricted: boolean;
}

export type MvrPopulateDriverRiskResponse = Array<MvrPopulateDriverWrapper>;

export interface MvrPopulateDriverWrapper {
    driver: MvrDriverRiskResponse;
    isDriverVerified: boolean;
    status: string;
    warnings: MvrWarning | null;
    error: MvrApiMessage | null;
}
export interface MvrWarning {
    code: string;
    message: string;
}
