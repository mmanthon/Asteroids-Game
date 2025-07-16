/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
import { EndorsementStatusDisplayValueEnum } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { MvrDriverRiskResponse } from '../../../shared/external';
import { DriverRiskQuery } from '../driverRisk.query';
import { DriverRiskUtil } from '../driverRisk.util';
import { MedStatusEnum, NewOrRenewalEnum } from '../enums';

function buildDriver(overrides: Partial<MvrDriverRiskResponse> = {}): MvrDriverRiskResponse {
    return {
        firstName: 'John',
        lastName: 'Doe',
        licenseNum: 'X1234567',
        licenseType: null,
        isVerified: null,
        isRenewed: true,
        dob: '1990-01-01',
        licenseEffectiveDate: '2020-01-01',
        commLicenseEffectiveDate: null,
        licenseState: 'CA',
        licenseExpirationDate: '2030-01-01',
        medicalIssuedDate: '2022-01-01',
        totalMajorGuiltyCount: 0,
        totalMinorGuiltyCount: 0,
        totalMovingGuiltyCount: 0,
        totalNonMovingGuiltyCount: 0,
        totalAccidentCount: 0,
        latestRunDate: '2024-01-01',
        latestCallStatus: 'SUCCESS',
        updated: '',
        lookBackStartDate: null,
        lookBackEndDate: null,
        actions: [],
        violations: [],
        errors: [],
        driverFound: false,
        fullName: '',
        totalViolationCount: 0,
        totalMajorCount: 0,
        totalMinorCount: 0,
        ...overrides,
    };
}

describe('DriverRiskUtil', () => {
    let util: DriverRiskUtil;
    let driverRiskQuery: DriverRiskQuery;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DriverRiskUtil,
                {
                    provide: DriverRiskQuery,
                    useValue: {
                        getDriversByAppID: jest.fn(),
                        getEndorsementsByAppID: jest.fn(),
                    },
                },
            ],
        }).compile();

        driverRiskQuery = module.get<DriverRiskQuery>(DriverRiskQuery);
        util = module.get<DriverRiskUtil>(DriverRiskUtil);
    });

    it('should include error from setErrorObject if driver has errors', () => {
        const drivers = [
            buildDriver({
                latestCallStatus: 'FAILURE',
                errors: [
                    { code: '500', description: 'DB error' },
                    { code: '123', description: 'Other error' },
                ],
            }),
        ];

        const result = util.formatResponse(drivers, new Map());

        expect(result[0].error).toEqual({ code: '500', message: 'DB error' });
    });

    it('should format drivers with correct medStatus and isNewOrRenewalDriver based on date and renewal flag', () => {
        const drivers = [
            buildDriver({ medicalIssuedDate: '2022-01-01', isRenewed: true }),
            buildDriver({ medicalIssuedDate: '2099-01-01', isRenewed: false, licenseNum: 'Z9876543' }),
        ];

        const result = util.formatResponse(drivers, new Map());

        expect(result[0].medStatus).toBe(MedStatusEnum.ACTIVE);
        expect(result[0].isNewOrRenewalDriver).toBe(NewOrRenewalEnum.REN);

        expect(result[1].medStatus).toBe(MedStatusEnum.INACTIVE);
        expect(result[1].isNewOrRenewalDriver).toBe(NewOrRenewalEnum.NEW);
    });

    it('should return undefined medStatus if medicalIssuedDate is null', () => {
        const drivers = [buildDriver({ medicalIssuedDate: null })];
        const result = util.formatResponse(drivers, new Map());

        expect(result[0].medStatus).toBeUndefined();
    });

    it('should return first error if no 500 error is present', () => {
        const drivers = [
            buildDriver({
                latestCallStatus: 'FAILURE',
                errors: [{ code: '123', description: 'Non-db error' }],
                licenseNum: 'ERR123',
            }),
        ];

        const result = util.formatResponse(drivers, new Map());

        expect(result[0].error).toEqual({ code: '123', message: 'Non-db error' });
    });

    it('should return undefined error if errors array is empty', () => {
        const drivers = [buildDriver({ licenseNum: 'NOERR123' })];
        const result = util.formatResponse(drivers, new Map());

        expect(result[0].error).toBeUndefined();
    });

    it('should format driver risk response with full data (indirectly tests nullToUndefined and nullToUndefinedBoolean)', () => {
        const drivers = [
            buildDriver({
                licenseType: null,
                isVerified: null,
                isRenewed: false,
                actions: [
                    {
                        code: null,
                        type: 'SUSPENSION',
                        source: 'DMV',
                        mailDate: '2022-02-01',
                        commercial: null,
                        incidentDate: '2022-01-15',
                        orderedDate: '2022-01-10',
                        startDate: null,
                        endDate: '2022-03-01',
                        thruDate: null,
                        thruStatus: null,
                        actualEndDate: '2022-03-01',
                        message: 'License suspended',
                    },
                ],
                violations: [
                    {
                        violationDate: '2021-12-01',
                        vehicleType: null,
                        severity: 'Minor',
                        type: 'Speeding',
                        description: 'Exceeded limit',
                        adjudicatedDate: null,
                        adjudicatedDescription: null,
                        disposition: null,
                        state: 'CA',
                        source: 'DMV',
                        evcCode: null,
                        isMoving: null,
                        isActionRestricted: null,
                    },
                ],
            }),
        ];

        const endorsementMap = new Map([
            [
                'X1234567',
                {
                    id: 'endorse-001',
                    createdDate: '2023-01-01',
                    status: EndorsementStatusDisplayValueEnum.BOUND,
                    boundDate: '2023-02-01',
                },
            ],
        ]);

        const result = util.formatResponse(drivers, endorsementMap);

        expect(result[0].licenseType).toBeUndefined();
        expect(result[0].isVerified).toBeUndefined();
    });

    describe('getDriverData (indirect)', () => {
        it('should remove duplicate drivers from raw drivers list (indirect)', async () => {
            const mockDrivers = [
                { firstname: 'Tracy', lastname: 'Smith', license: 'XYZ' },
                { firstname: 'Tracy', lastname: 'Smith', license: 'XYZ' },
                { firstname: 'Leonard', lastname: 'Dean', license: 'ABC' },
            ];

            driverRiskQuery.getDriversByAppID = jest.fn().mockResolvedValue(mockDrivers);
            driverRiskQuery.getEndorsementsByAppID = jest.fn().mockResolvedValue([]);

            const result = await util.getDriverData('test-app-id');

            expect(result.drivers).toHaveLength(2);
            expect(result.drivers).toEqual([
                { firstname: 'Tracy', lastname: 'Smith', license: 'XYZ' },
                { firstname: 'Leonard', lastname: 'Dean', license: 'ABC' },
            ]);
        });
    });

    it('should decrypt and parse endorsement driver correctly (full decrypt coverage)', async () => {
        const iv = Buffer.alloc(16, 1);
        const encryptedData = Buffer.from(
            JSON.stringify({
                addedDrivers: {
                    new: [
                        {
                            schedule_type: 'driver',
                            firstname: 'John',
                            lastname: 'Doe',
                            name: 'John Doe',
                            state: 'TX',
                            dob: '1980-02-02',
                            license: 'TX999888',
                        },
                    ],
                },
            }),
            'utf8',
        );

        const dummyHeader = Buffer.alloc(64, 0);
        const fullBuffer = Buffer.concat([dummyHeader, iv, encryptedData]);

        const endorsement = {
            application_endorsement_id: 'endorsement-321',
            data: fullBuffer.toString('base64'),
            encryption_key: 'mock-key-used-in-decrypt',
            status_name: 'Pending',
            created: '2024-06-10T00:00:00.000Z',
            endorsed_at: '2024-06-12T00:00:00.000Z',
        };

        driverRiskQuery.getDriversByAppID = jest.fn().mockResolvedValue([]);
        driverRiskQuery.getEndorsementsByAppID = jest.fn().mockResolvedValue([endorsement]);

        jest.spyOn(require('crypto'), 'pbkdf2Sync').mockReturnValueOnce(Buffer.alloc(32, 1));
        jest.spyOn(require('crypto'), 'createDecipheriv').mockReturnValueOnce({
            update: () => Buffer.from(encryptedData),
            final: () => Buffer.from([]),
        });

        const result = await util.getDriverData('some-app-id');

        expect(result.drivers[0]).toMatchObject({
            firstname: 'John',
            lastname: 'Doe',
            license: 'TX999888',
        });
    });
});
