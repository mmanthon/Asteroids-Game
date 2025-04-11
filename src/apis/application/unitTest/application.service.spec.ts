import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { ApplicationService } from '../application.service';
import { ApplicationUtil } from '../application.util';
import { FilterParamDto } from '../dto';
import { mockFindAllResult, mockPaginationDto, mockSimplifiedApplicationDto } from '../mocks';

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
                        getBaseFormattedApplicationData: jest.fn(),
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
        jest.spyOn(applicationUtil, 'getBaseFormattedApplicationData').mockResolvedValue(mockSimplifiedApplicationDto);

        const result = await service.findAll({} as FilterParamDto);

        expect(applicationQuery.findAll).toHaveBeenCalled();
        expect(applicationUtil.getBaseFormattedApplicationData).toHaveBeenCalled();
        expect(result.applications).toEqual([mockSimplifiedApplicationDto]);
        expect(result.pagination).toEqual(mockPaginationDto);
    });
});
