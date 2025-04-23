import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';

import { mockDriverQueryResult, mvrApiResponseMock, testUrl } from '../../../apis/creditScore/mocks';
import { MvrApiException } from '../../exceptions/mvrApi.exception';
import { MvrIntegrationService } from '../mvr/mvr.external';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MvrIntegrationService', () => {
    let service: MvrIntegrationService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MvrIntegrationService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(testUrl),
                    },
                },
            ],
        }).compile();

        service = module.get<MvrIntegrationService>(MvrIntegrationService);
        configService = module.get<ConfigService>(ConfigService);

        // Mock axios.create to return the mocked axios instance
        mockedAxios.create = jest.fn().mockReturnValue(mockedAxios);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get the .env from config service', () => {
        const apiUrl = configService.get('MVR_API_URL');

        expect(configService.get).toHaveBeenCalledWith('MVR_API_URL');
        expect(apiUrl).toBe('http://mock-api-url.com');
    });

    describe('getCreditScoreData', () => {
        it('should return credit score data', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(testUrl);
            mockedAxios.post.mockResolvedValue({ data: mvrApiResponseMock });

            const result = await service.getCreditScoreData('12345', mockDriverQueryResult);

            expect(result).toEqual(mvrApiResponseMock);
        });

        it('should build the driver request object even if the drive has no dob', async () => {
            const driverWithoutDob = { ...mockDriverQueryResult[0], dob: null };
            const driversWithNoDob = [driverWithoutDob, ...mockDriverQueryResult.slice(1)];

            jest.spyOn(configService, 'get').mockReturnValue(testUrl);
            mockedAxios.post.mockResolvedValue({ data: mvrApiResponseMock });

            const result = await service.getCreditScoreData('12345', driversWithNoDob);

            expect(result).toEqual(mvrApiResponseMock);
        });

        it('should throw an MvrApiException on error', async () => {
            const mvrApiException = new MvrApiException('Failed to get credit score data');

            jest.spyOn(configService, 'get').mockReturnValue(testUrl);
            mockedAxios.post.mockRejectedValue(new Error('Failed to get credit score data'));

            await expect(service.getCreditScoreData('12345', mockDriverQueryResult)).rejects.toThrow(mvrApiException);
        });
    });

    describe('pullCreditScoreData', () => {
        it('should return pulled credit score data', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(testUrl);
            mockedAxios.post.mockResolvedValue({ data: mvrApiResponseMock });

            const result = await service.pullCreditScoreData('12345', mockDriverQueryResult);

            expect(result).toEqual(mvrApiResponseMock);
        });

        it('should throw an MvrApiException on error', async () => {
            const mvrApiException = new MvrApiException('Failed to pull credit score data');

            jest.spyOn(configService, 'get').mockReturnValue(testUrl);
            mockedAxios.post.mockRejectedValue(new Error('Failed to pull credit score data'));

            await expect(service.pullCreditScoreData('12345', mockDriverQueryResult)).rejects.toThrow(mvrApiException);
        });
    });
});
