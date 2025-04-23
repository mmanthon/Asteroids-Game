import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

import {
    MvrApiCreditScoreRequest,
    MvrApiCreditScoreResponse,
    MvrDriverRiskRequest,
    MvrDriverRiskResponse,
    MvrPopulateDriverRiskResponse,
} from './mvr.interface';
import { MvrApiException } from '../../exceptions';
import { AmpDriver, GetDriverQueryResult } from '../../interfaces';

@Injectable()
export class MvrIntegrationService {
    private readonly logger = new Logger(MvrIntegrationService.name);
    private readonly axiosClient: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        this.axiosClient = axios.create({
            baseURL: this.configService.get<string>('mvrApiUrl'),
        });
    }

    /**
     * @description get driver data for an application
     * @param {AmpDriver[]} drivers
     * @returns {Promise<MvrDriverRiskResponse[]>}
     */
    async fetchDriverData(drivers: AmpDriver[]): Promise<MvrDriverRiskResponse[]> {
        const driverRequestObject = await this.buildDriverRiskPayload(drivers);

        try {
            const { data } = await this.axiosClient.post('/drivers/get', driverRequestObject);

            return data;
        } catch (error) {
            const errorMessage = error?.response?.data?.errors || error.message;

            this.logger.error({
                message: 'Failed to fetch driver data from MVR API: ' + JSON.stringify(errorMessage),
                stack: error.stack,
            });
            throw new MvrApiException(error.message);
        }
    }

    /**
     * @description populate mvr driver data for an application
     * @param {AmpDriver[]} drivers
     * @returns {Promise<MvrPopulateDriverRiskResponse>}
     */
    async populateDriverData(drivers: GetDriverQueryResult[]): Promise<MvrPopulateDriverRiskResponse> {
        const populateDriverRequestObject = await this.buildDriverRiskPayload(drivers);

        try {
            const { data } = await this.axiosClient.post('/drivers', populateDriverRequestObject);

            return data;
        } catch (error) {
            const errorMessage = error?.response?.data?.errors || error.message;

            this.logger.error({
                message: 'Failed to populate driver data from MVR API: ' + JSON.stringify(errorMessage),
                stack: error.stack,
            });
            throw new MvrApiException(error.message);
        }
    }

    /**
     * @description Get credit score data for an application
     * @param {string} appID
     * @param {GetDriverQueryResult[]} drivers
     * @returns {Promise<MvrApiCreditScoreResponse>}
     */
    async getCreditScoreData(appID: string, drivers: GetDriverQueryResult[]): Promise<MvrApiCreditScoreResponse> {
        const driverRequestObject = this.buildCreditScorePayload(appID, drivers);

        try {
            const { data } = await this.axiosClient.post('/credit-score/get', driverRequestObject);

            this.logger.log(`MVR API response from getCreditScore: ${JSON.stringify(data)}`);

            return data;
        } catch (error) {
            this.logger.error({
                message: 'Failed to get credit score data from MVR API:' + error.message,
                stack: error.stack,
            });
            throw new MvrApiException(error.message);
        }
    }

    /**
     * @description Pull credit score data for an application
     * @param {string} appID
     * @param {GetDriverQueryResult[]} drivers
     * @returns {Promise<MvrApiCreditScoreResponse>}
     */
    async pullCreditScoreData(appID: string, drivers: GetDriverQueryResult[]): Promise<MvrApiCreditScoreResponse> {
        const driverRequestObject = this.buildCreditScorePayload(appID, drivers);

        try {
            const { data } = await this.axiosClient.post('/credit-score', driverRequestObject);

            this.logger.log(`MVR API response for pullCreditScore: ${JSON.stringify(data)}`);

            return data;
        } catch (error) {
            this.logger.error({
                message: 'Failed to pull credit score data from MVR API:' + error.message,
                stack: error.stack,
            });
            throw new MvrApiException(error.message);
        }
    }

    /**
     * @description build driver request object for fetching driver data from MVR
     * @param {AmpDriver[]} drivers
     * @returns {Promise<MvrDriverRiskRequest>}
     */
    private async buildDriverRiskPayload(drivers: AmpDriver[]): Promise<MvrDriverRiskRequest> {
        return {
            drivers: drivers.map(({ firstname, lastname, name, state, dob, license }) => {
                const baseDriver = {
                    licenseState: state.trim(),
                    dob: dob ? new Date(dob).toISOString().split('T')[0] : '',
                    licenseNum: license,
                };

                return firstname && lastname
                    ? { ...baseDriver, firstName: firstname, lastName: lastname }
                    : { ...baseDriver, fullName: name };
            }),
        };
    }

    /**
     * @description Build credit score request object for MVR API
     * @param {string} appID
     * @param {GetDriverQueryResult[]} drivers
     * @returns {MvrApiDriverRequest}
     */
    private buildCreditScorePayload(appID: string, drivers: GetDriverQueryResult[]): MvrApiCreditScoreRequest {
        const mappedDrivers = drivers.map((driver) => ({
            firstName: driver.firstname,
            lastName: driver.lastname,
            dob: driver.dob ? new Date(driver.dob).toISOString().split('T')[0] : '',
            licenseNum: driver.license,
        }));

        return {
            appID: appID,
            drivers: mappedDrivers,
        };
    }
}
