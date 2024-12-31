import { Test, TestingModule } from '@nestjs/testing';

import { AmpTemplateQueries } from '../../../databases/amp/queries';
import { DynamodbTemplateQueries } from '../../../databases/dynamodb/queries';
import { TemplateService } from '../template.service';

/**
 * This is an example of a service unit test
 * Remove or edit this file as needed.
 * */
describe('TemplateService', () => {
    let service: TemplateService;
    let ampQueries: AmpTemplateQueries;
    let dynamodbQueries: DynamodbTemplateQueries;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TemplateService,
                {
                    provide: AmpTemplateQueries,
                    useValue: {
                        updateSubmissionStatus: jest.fn(),
                    },
                },
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
        ampQueries = module.get<AmpTemplateQueries>(AmpTemplateQueries);
        dynamodbQueries = module.get<DynamodbTemplateQueries>(DynamodbTemplateQueries);
    });

    it('should be defined', () => {
        ampQueries;
        dynamodbQueries;
        expect(service).toBeDefined();
    });
});
