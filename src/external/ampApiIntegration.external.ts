/* eslint-disable camelcase */
import { AddressDto, HazardhubApiResponseDto, HazardhubResultDto } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';

@Injectable()
export class AmpApiIntegration {
    private readonly logger = new Logger('AmpAPI');
    private readonly axiosClient: Axios;

    constructor(private readonly configService: ConfigService) {
        this.axiosClient = axios.create({
            baseURL: this.configService.get<string>('ampApiBaseUrl'),
        });
    }

    /**
     * @description Get hazardhub data from amp api
     * @param {AddressDto} address
     * @returns {Promise<HazardhubResultDto>}
     */
    async getHazardhubData(address: AddressDto): Promise<HazardhubResultDto> {
        const payload = {
            ...address,
            street: address.streetAddress,
            zip: this.normalizeZipCode(address.zip),
        };

        try {
            const { data } = await this.axiosClient.post<HazardhubApiResponseDto>('hazard-hub', payload, {
                headers: {
                    Authorization: `Bearer hazard_hub:${this.configService.get<string>('ampApiKey')}`,
                },
            });

            return data.data.results;
        } catch (error) {
            const errorMessage = error.response?.data?.response || error.message;

            this.logger.error('Amp API request error. Failed to get hazardhub data', {
                message: errorMessage,
                statusCode: error.response?.status,
            });

            throw error;
        }
    }

    /**
     * @description Normalize zip code
     * @param {string} zip
     * @returns {string}
     */
    private normalizeZipCode(zip: string): string {
        const cleanedZip = zip.split('-')[0].replace(/[^0-9]/g, '');

        return cleanedZip.padStart(5, '0').slice(-5);
    }
}
