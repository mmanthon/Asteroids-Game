import { Test, TestingModule } from '@nestjs/testing';

import { DynamodbTemplateQueries } from '../../../databases/dynamodb/queries';
import { TemplateController } from '../template.controller';
import { TemplateService } from '../template.service';

/**
 * This is an example of a controller unit test
 * Remove or edit this file as needed.
 */
describe('TemplateController', () => {
    let controller: TemplateController;
    let service: TemplateService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TemplateController],
            providers: [
                { provide: DynamodbTemplateQueries, useValue: {} },
                {
                    provide: TemplateService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<TemplateController>(TemplateController);
        service = module.get<TemplateService>(TemplateService);
    });

    it('should be defined', () => {
        service;
        expect(controller).toBeDefined();
    });
});
