import { AddressDto } from '@ignidus/iscx-backend-utils';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosInstance } from 'axios';

import { AmpApiIntegration } from '../ampApi';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AmpApiIntegration', () => {
    let service: AmpApiIntegration;
    let configService: ConfigService;
    let axiosClientMock: jest.Mocked<AxiosInstance>;

    beforeEach(async () => {
        axiosClientMock = {
            post: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<AxiosInstance>;

        configService = {
            get: jest.fn((key: string) => {
                if (key === 'ampApiKey') return 'fake-api-key';
                if (key === 'ampApiBaseUrl') return 'https://api.example.com';

                return '';
            }),
        } as unknown as jest.Mocked<ConfigService>;

        mockedAxios.create.mockReturnValue(axiosClientMock);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AmpApiIntegration,
                {
                    provide: ConfigService,
                    useValue: configService,
                },
            ],
        }).compile();

        service = module.get<AmpApiIntegration>(AmpApiIntegration);
    });

    it('should return results on successful response', async () => {
        const payload: AddressDto = {
            city: 'Dallas',
            streetAddress: '123 Main St',
            state: 'TX',
            zip: '75201',
        };

        axiosClientMock.post.mockResolvedValueOnce({
            data: {
                data: {
                    success: true,
                    results: { hazard: 'data' },
                    errors: [],
                },
            },
        });

        const result = await service.getHazardhubData(payload);

        expect(result).toEqual({ hazard: 'data' });
        expect(axiosClientMock.post).toHaveBeenCalledWith('hazard-hub', expect.anything(), {
            headers: {
                Authorization: 'Bearer hazard_hub:fake-api-key',
            },
        });
    });

    it('should throw if response success is false and errors exist', async () => {
        const mockResponse = {
            data: {
                data: {
                    success: false,
                    results: null,
                    errors: [{ message: 'Invalid address' }],
                },
            },
        };

        axiosClientMock.post.mockResolvedValueOnce(mockResponse);

        await expect(service.getHazardhubData({ streetAddress: '', zip: '' } as AddressDto)).rejects.toThrow(
            'Invalid address',
        );
    });

    it('should throw the response error message if axios fails with data', async () => {
        axiosClientMock.post.mockRejectedValueOnce({
            response: {
                data: {
                    response: 'API error occurred',
                },
            },
            message: 'Fallback error',
        });

        await expect(service.getHazardhubData({ streetAddress: '', zip: '' } as AddressDto)).rejects.toMatchObject({
            response: {
                data: {
                    response: 'API error occurred',
                },
            },
        });
    });

    it('should throw the fallback error if axios fails without response data', async () => {
        axiosClientMock.post.mockRejectedValueOnce({ message: 'Network error' });

        await expect(service.getHazardhubData({ streetAddress: '', zip: '' } as AddressDto)).rejects.toMatchObject({
            message: 'Network error',
        });
    });

    it('should normalize zip code and remove accents from street address', async () => {
        const spyZip = jest.spyOn(
            AmpApiIntegration.prototype as unknown as { normalizeZipCode: (zip: string) => string },
            'normalizeZipCode',
        );
        const spyAccent = jest.spyOn(
            AmpApiIntegration.prototype as unknown as { removeAccents: (addr: string) => string },
            'removeAccents',
        );

        const mockResponse = {
            data: {
                data: {
                    success: true,
                    results: { ok: true },
                    errors: [],
                },
            },
        };

        axiosClientMock.post.mockResolvedValueOnce(mockResponse);

        const input: AddressDto = {
            streetAddress: '123 Main St',
            zip: '75201',
            city: '',
            state: '',
        };

        await service.getHazardhubData(input);

        expect(spyZip).toHaveBeenCalledWith(input.zip);
        expect(spyAccent).toHaveBeenCalledWith(input.streetAddress);
    });
});
