/* eslint-disable no-control-regex */
/* eslint-disable camelcase */
import { createDecipheriv, pbkdf2Sync } from 'crypto';

import { EndorsementStatusDisplayValueEnum } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { DriverRiskQuery } from './driverRisk.query';
import { DriverRiskResponseDto, EndorsementDto, ErrorDto } from './dto';
import { MedStatusEnum, NewOrRenewalEnum } from './enums';
import { DecryptedEndorsement, EndorsementDriver } from './interfaces';
import { MvrApiMessage, MvrDriverRiskResponse } from '../../shared/external';
import { AmpDriver, GetDriverQueryResult } from '../../shared/interfaces';

@Injectable()
export class DriverRiskUtil {
    constructor(private readonly driverRiskQuery: DriverRiskQuery) {}

    /**
     * @description Format driver risk response
     * @param {ITransitionMvrDriverResponse[]} drivers
     * @param {Map<string, EndorsementDto>} endorsementMap
     * @returns {MvrDriverRiskResponse[]}
     */
    formatResponse(
        drivers: MvrDriverRiskResponse[],
        endorsementMap?: Map<string, EndorsementDto>,
    ): DriverRiskResponseDto[] {
        return drivers.map((driver) => this.formatDriver(driver, endorsementMap));
    }

    /**
     * @description get driver data for an application from amp and maps the id and endorsement details
     * @param {string} appID
     * @returns {Promise<DriverData>}
     */
    async getDriverData(appID: string): Promise<{ drivers: AmpDriver[]; endorsementMap: Map<string, EndorsementDto> }> {
        const [existingDrivers, activeEndorsementDrivers] = await Promise.all([
            this.driverRiskQuery.getDriversByAppID(appID),
            this.getEndorsementDrivers(appID),
        ]);
        const filteredExistingDrivers = this.filterDuplicateDrivers(existingDrivers);

        const endorsementMap = this.createEndorsementMap(activeEndorsementDrivers);
        const drivers = [...filteredExistingDrivers, ...activeEndorsementDrivers];

        return { drivers, endorsementMap };
    }

    /**
     * @description Filter duplicate drivers
     * @param {GetDriverQueryResult[]} drivers
     * @returns {GetDriverQueryResult[]}
     */
    private filterDuplicateDrivers(drivers: GetDriverQueryResult[]): GetDriverQueryResult[] {
        return Array.from(
            drivers
                .reduce((driverMap, driver) => {
                    const key = `${driver.firstname}-${driver.lastname}-${driver.license}`;

                    if (!driverMap.has(key)) driverMap.set(key, driver);

                    return driverMap;
                }, new Map<string, GetDriverQueryResult>())
                .values(),
        );
    }

    /**
     * @description Get endorsement drivers
     * @param {string} appID
     * @returns {Promise<EndorsementDriver[]>}
     */
    private async getEndorsementDrivers(appID: string): Promise<EndorsementDriver[]> {
        const activeEndorsements = await this.driverRiskQuery.getEndorsementsByAppID(appID);

        return activeEndorsements.reduce<EndorsementDriver[]>((acc, endorsement) => {
            const { data, encryption_key, status_name, created } = endorsement;
            const decryptedData = this.decrypt(Buffer.from(data, 'base64'), encryption_key);
            const jsonData: DecryptedEndorsement = JSON.parse(decryptedData);

            jsonData?.addedDrivers?.new?.forEach((driver) => {
                if (driver.schedule_type === 'driver') {
                    acc.push({
                        application_endorsement_id: String(endorsement.application_endorsement_id),
                        firstname: driver.firstname,
                        lastname: driver.lastname,
                        name: driver.name,
                        state: driver.state,
                        dob: driver.dob,
                        license: driver.license,
                        status_name: status_name,
                        created,
                    });
                }
            });

            return acc;
        }, []);
    }

    /**
     * @description create map of driver license to endorsement details
     * @param {GetDriverQueryResult[]} endorsements
     * @returns {Map<string, EndorsementDto>}
     */
    private createEndorsementMap(endorsements: EndorsementDriver[]): Map<string, EndorsementDto> {
        return new Map(
            endorsements.map((driver) => [
                driver.license,
                {
                    id: driver.application_endorsement_id,
                    createdDate: driver.created,
                    status: driver.status_name as EndorsementStatusDisplayValueEnum,
                    boundDate: driver.endorsed_at,
                },
            ]),
        );
    }

    /**
     * @description Decrypt amp  data
     * @param {Buffer} data The data to decrypt
     * @param {string} key The key to use for decryption
     * @returns {Buffer} The decrypted data
     */
    private decrypt(data: Buffer, key: string): string {
        const iv = data.subarray(64, 80);
        const encryptedData = data.subarray(80);

        const keys = pbkdf2Sync(key, iv, 10000, 32, 'sha256').toString('hex');
        const encKey = keys.slice(0, 32);

        const decipher = createDecipheriv('aes-256-cbc', encKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

        return decrypted.toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    }

    /**
     * @description Determine if the medical status is active or inactive or NA
     * @param { string } medicalIssueDate
     * @returns { MedStatusEnum } MedStatusEnum
     */
    private checkMedStatusActive(medicalIssueDate: string): MedStatusEnum {
        // check if the medical issue date is null before converting to a date
        if (medicalIssueDate === null) return;

        const date = new Date(medicalIssueDate);

        if (date < new Date()) {
            return MedStatusEnum.ACTIVE;
        }

        return MedStatusEnum.INACTIVE;
    }

    /**
     * @description Check if the driver is a new or renewal driver
     * @param {boolean} isRenewed;
     * @returns {NewOrRenewalEnum} NewOrRenewalEnum
     */
    private checkIsRenewalDriver(isRenewed: boolean): NewOrRenewalEnum {
        return isRenewed ? NewOrRenewalEnum.REN : NewOrRenewalEnum.NEW;
    }

    /**
     * @description Formats a driver object into a specific structure.
     * @param {MvrDriverRiskResponse} driver - The driver object to format.
     * @param {Map<string, EndorsementDto>} endorsementMap - A map of license numbers to endorsements.
     * @returns {DriverRiskResponseDto} - The formatted driver object.
     */
    private formatDriver(
        driver: MvrDriverRiskResponse,
        endorsementMap?: Map<string, EndorsementDto>,
    ): DriverRiskResponseDto {
        return {
            firstName: driver.firstName,
            lastName: driver.lastName,
            licenseNumber: driver.licenseNum,
            licenseType: this.nullToUndefined(driver.licenseType),
            isVerified: this.nullToUndefinedBoolean(driver.isVerified),
            isNewOrRenewalDriver: this.checkIsRenewalDriver(driver.isRenewed),
            dob: driver.dob,
            originalDateLicensed: this.nullToUndefined(driver.licenseEffectiveDate),
            commercialIssueDate: this.nullToUndefined(driver.commLicenseEffectiveDate),
            licenseState: driver.licenseState,
            licenseExpiration: this.nullToUndefined(driver.licenseExpirationDate),
            medStatus: driver.medicalIssuedDate ? this.checkMedStatusActive(driver.medicalIssuedDate) : undefined,
            totalMajorCount: driver.totalMajorGuiltyCount,
            totalMinorCount: driver.totalMinorGuiltyCount,
            totalMoving: driver.totalMovingGuiltyCount,
            totalNonMoving: driver.totalNonMovingGuiltyCount,
            totalAccidents: driver.totalAccidentCount,
            latestRunDate: driver.latestRunDate,
            latestCallStatus: driver.latestCallStatus,
            updated: driver.updated,
            lookBackStart: this.nullToUndefined(driver.lookBackStartDate),
            lookBackEnd: this.nullToUndefined(driver.lookBackEndDate),
            actions: driver?.actions?.map((action) => ({
                code: this.nullToUndefined(action.code),
                type: this.nullToUndefined(action.type),
                source: this.nullToUndefined(action.source),
                mailDate: this.nullToUndefined(action.mailDate),
                commercial: this.nullToUndefinedBoolean(action.commercial),
                incidentDate: this.nullToUndefined(action.incidentDate),
                orderedDate: this.nullToUndefined(action.orderedDate),
                startDate: this.nullToUndefined(action.startDate),
                endDate: this.nullToUndefined(action.endDate),
                thruDate: this.nullToUndefined(action.thruDate),
                thruStatus: this.nullToUndefined(action.thruStatus),
                actualEndDate: this.nullToUndefined(action.actualEndDate),
                message: this.nullToUndefined(action.message),
            })),
            violations: driver?.violations?.map((violation) => ({
                violationDate: violation.violationDate,
                vehicleType: this.nullToUndefined(violation.vehicleType),
                severity: this.nullToUndefined(violation.severity),
                violationType: violation.type,
                violationDescription: violation.description,
                adjudicationDate: this.nullToUndefined(violation.adjudicatedDate),
                adjudicationDescription: this.nullToUndefined(violation.adjudicatedDescription),
                dispositionOfViolation: this.nullToUndefined(violation.disposition),
                locationOfViolation: this.nullToUndefined(violation.state),
                incidentSource: violation.source,
                evcCode: this.nullToUndefined(violation.evcCode),
                isMovingViolation: this.nullToUndefinedBoolean(violation.isMoving),
                isActionRestricted: this.nullToUndefinedBoolean(violation.isActionRestricted),
                runDate: driver.latestRunDate,
            })),
            endorsement: endorsementMap?.get(driver.licenseNum),
            error: this.setErrorObject(driver.errors),
        };
    }

    /**
     * @description Set error object in response if there is an error in the driver response
     * @param {ITransitionMvrError[]} errors
     * @returns {ErrorDto}
     */
    private setErrorObject(errors: MvrApiMessage[]): ErrorDto {
        if (errors.length === 0) return;

        const tuDatabaseError = errors.find((error) => error.code === '500');

        // check if the error is a database error
        if (tuDatabaseError) {
            return {
                code: tuDatabaseError.code,
                message: tuDatabaseError.description,
            };
        }

        // return the first error in the array
        return {
            code: errors[0].code,
            message: errors[0].description,
        };
    }

    /**
     * @description check if the property is null and convert to undefined
     * @param {string | null} value;
     * @returns {string | undefined}
     */
    private nullToUndefined(value: string | null): string | undefined {
        return value === null ? undefined : value;
    }

    /**
     * @description Check if the boolean property is null and convert to undefined
     * @param {boolean | null} value;
     * @returns {boolean | undefined}
     */
    private nullToUndefinedBoolean(value: boolean | null): boolean | undefined {
        return value === null ? undefined : value;
    }
}
