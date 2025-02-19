import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

// import { GetDriverQueryResult, MvrApiCreditScoreResponse } from '../../interfaces';
import { MvrIntegrationService } from '../mvrIntegration.external';

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
                        get: jest.fn().mockReturnValue('http://mock-api-url.com'),
                    },
                },
            ],
        }).compile();

        service = module.get<MvrIntegrationService>(MvrIntegrationService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should get the .env from config service', () => {
        const apiUrl = configService.get('MVR_API_URL');

        expect(configService.get).toHaveBeenCalledWith('MVR_API_URL');
        expect(apiUrl).toBe('http://mock-api-url.com');
    });
});
