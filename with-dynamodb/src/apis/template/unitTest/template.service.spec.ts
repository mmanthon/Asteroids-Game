import { Test, TestingModule } from '@nestjs/testing';

import { DynamodbTemplateQueries } from '../../../databases/dynamodb/queries';
import { TemplateService } from '../template.service';

/**
 * This is an example of a service unit test
 * Remove or edit this file as needed.
 * */
describe('TemplateService', () => {
    let service: TemplateService;
    let dynamodbQueries: DynamodbTemplateQueries;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TemplateService,

                {
                    provide: DynamodbTemplateQueries,
                    useValue: {
                        findProduct: jest.fn(),
                        getSubmission: jest.fn(),
                        getApplicationBySubmissionID: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TemplateService>(TemplateService);
        dynamodbQueries = module.get<DynamodbTemplateQueries>(DynamodbTemplateQueries);
    });

    it('should be defined', () => {
        dynamodbQueries;
        expect(service).toBeDefined();
    });
});
