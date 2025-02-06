import { Test, TestingModule } from '@nestjs/testing';

import { CreditScoreController } from '../creditScore.controller';
import { CreditScoreService } from '../creditScore.service';

describe('CreditScoreController', () => {
    let controller: CreditScoreController;
    let service: CreditScoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CreditScoreController],
            providers: [CreditScoreService],
        }).compile();

        controller = module.get<CreditScoreController>(CreditScoreController);
        service = module.get<CreditScoreService>(CreditScoreService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });
});
