import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { ApplicationService } from '../application.service';
import { ApplicationUtil } from '../application.util';
import { FilterParamDto } from '../dto';
import { AmpApplication } from '../interfaces';
import { mockFindAllResult, mockPagination, mockSimplifiedApplication } from '../mocks';

describe('ApplicationService', () => {
    let service: ApplicationService;
    let applicationQuery: ApplicationQuery;
    let applicationUtil: ApplicationUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationService,
                {
                    provide: ApplicationQuery,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue(mockFindAllResult),
                    },
                },
                {
                    provide: ApplicationUtil,
                    useValue: {
                        formatSimplifiedApplication: jest.fn(),
                    },
                },
                { provide: ItemEntity, useValue: {} },
            ],
        }).compile();

        service = module.get<ApplicationService>(ApplicationService);
        applicationQuery = module.get<ApplicationQuery>(ApplicationQuery);
        applicationUtil = module.get<ApplicationUtil>(ApplicationUtil);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return simplified applications with pagination', async () => {
        const expectedFormatted = [mockSimplifiedApplication, { ...mockSimplifiedApplication, id: '2' }];

        jest.spyOn(applicationUtil, 'formatSimplifiedApplication').mockImplementation(async (app: AmpApplication) => ({
            ...mockSimplifiedApplication,
            id: String(app.item_id),
        }));

        const result = await service.findAll({} as FilterParamDto);

        expect(applicationQuery.findAll).toHaveBeenCalled();
        expect(applicationUtil.formatSimplifiedApplication).toHaveBeenCalled();
        expect(result.applications).toEqual(expectedFormatted);
        expect(result.pagination).toEqual(mockPagination);
    });
});
