import { Injectable } from '@nestjs/common';

import { DriverRiskQuery } from './driverRisk.query';
import { DriverRiskUtil } from './driverRisk.util';
import { DriverRiskRequestDto, DriverRiskResponseDto } from './dto';
import { MvrIntegrationService } from '../../shared/external';

@Injectable()
export class DriverRiskService {
    constructor(
        private readonly mvrApiIntegration: MvrIntegrationService,
        private readonly driverRiskUtil: DriverRiskUtil,
        private readonly driverRiskQuery: DriverRiskQuery,
    ) {}

    /**
     * @description get driver risk data for an application
     * @param {string} appID
     * @returns {Promise<DriverRiskResponseDto[]>}
     */
    async getDriverRisk(appID: string): Promise<DriverRiskResponseDto[]> {
        const { drivers, endorsementMap } = await this.driverRiskUtil.getDriverData(appID);
        const driverResponse = await this.mvrApiIntegration.fetchDriverData(drivers);

        return this.driverRiskUtil.formatResponse(driverResponse, endorsementMap);
    }

    /**
     * @description populate driver risk data for an application
     * @param {string} appID
     * @param {DriverRiskRequestDto} driverRequest
     * @returns {Promise<DriverRiskResponseDto[]>}
     */
    async populateDriverRisk(appID: string, driverRequest: DriverRiskRequestDto): Promise<DriverRiskResponseDto[]> {
        const { licenseNumbers } = driverRequest;

        const drivers = await Promise.all(
            licenseNumbers.map(async (licenseNumber) => {
                return this.driverRiskQuery.getDriverByLicenseNumber(licenseNumber);
            }),
        );

        const driverResponse = await this.mvrApiIntegration.populateDriverData(drivers);
        const mappedDrivers = driverResponse.map((item) => item.driver);

        return this.driverRiskUtil.formatResponse(mappedDrivers);
    }
}
