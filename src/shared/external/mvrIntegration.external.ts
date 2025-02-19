import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

import { MvrApiException } from '../exceptions';
import { GetDriverQueryResult, MvrApiCreditScoreRequest, MvrApiCreditScoreResponse } from '../interfaces';

@Injectable()
export class MvrIntegrationService {
    private readonly logger = new Logger(MvrIntegrationService.name);
    private readonly axiosClient: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        this.axiosClient = axios.create({
            baseURL: this.configService.get<string>('mvrApiUrl') + '/credit-score',
        });
    }

    /**
     * @description Get credit score data for an application
     * @param {string} appID
     * @param {GetDriverQueryResult[]} drivers
     * @returns {Promise<MvrApiCreditScoreResponse>}
     */
    async getCreditScoreData(appID: string, drivers: GetDriverQueryResult[]): Promise<MvrApiCreditScoreResponse> {
        const driverRequestObject = this.buildDriverRequestObject(appID, drivers);

        try {
            const { data } = await this.axiosClient.post('/get', driverRequestObject);

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
        const driverRequestObject = this.buildDriverRequestObject(appID, drivers);

        try {
            const { data } = await this.axiosClient.post('/', driverRequestObject);

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
     * @description Build driver request object for fetching driver data from MVR
     * @param {string} appID
     * @param {GetDriverQueryResult[]} drivers
     * @returns {MvrApiDriverRequest}
     */
    private buildDriverRequestObject(appID: string, drivers: GetDriverQueryResult[]): MvrApiCreditScoreRequest {
        const mappedDrivers = drivers.map((driver) => ({
            firstName: driver.firstname,
            lastName: driver.lastname,
            dob: driver.dob ? new Date(driver.dob).toISOString().split('T')[0] : '',
        }));

        return {
            appID: appID,
            drivers: mappedDrivers,
        };
    }
}
