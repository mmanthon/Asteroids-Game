import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from '../health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    describe('health', () => {
        it('should return an empty string', () => {
            const result = controller.health();

            expect(result).toEqual('');
        });
    });
});
