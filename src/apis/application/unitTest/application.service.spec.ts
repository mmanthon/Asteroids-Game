import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { ApplicationService } from '../application.service';
import { ApplicationUtil } from '../application.util';
import { FilterParamDto } from '../dto';
import {
    appID,
    mockAmpApplication,
    mockApplicationDto,
    mockFindAllResult,
    mockPaginationDto,
    mockSimplifiedApplicationDto,
    mockUpdateApplicationRequestDto,
    mockUser,
} from '../mocks';

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
                        findOne: jest.fn().mockResolvedValue(mockAmpApplication),
                        assignAgentToApplication: jest.fn(),
                    },
                },
                {
                    provide: ApplicationUtil,
                    useValue: {
                        getBaseFormattedApplicationData: jest.fn(),
                        formatApplication: jest.fn().mockResolvedValue(mockApplicationDto),
                        handleUnderwriterAssignment: jest.fn().mockResolvedValue(undefined),
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

    it('should return a single application formatted for the user', async () => {
        jest.spyOn(applicationQuery, 'findOne').mockResolvedValue(mockAmpApplication);

        const result = await service.findOne(appID, mockUser);

        expect(applicationQuery.findOne).toHaveBeenCalledWith(appID);
        expect(applicationUtil.formatApplication).toHaveBeenCalledWith(mockAmpApplication, mockUser);
        expect(result).toBe(mockApplicationDto);
    });

    it('Should update an application assign users and agent if provided', async () => {
        jest.spyOn(applicationUtil, 'handleUnderwriterAssignment').mockResolvedValue(undefined);
        jest.spyOn(applicationQuery, 'assignAgentToApplication').mockResolvedValue(undefined);
        jest.spyOn(applicationQuery, 'findOne').mockResolvedValue(mockAmpApplication);
        jest.spyOn(applicationUtil, 'formatApplication').mockResolvedValue(mockApplicationDto);

        const result = await service.updateOne(appID, mockUpdateApplicationRequestDto, mockUser);

        expect(applicationUtil.handleUnderwriterAssignment).toHaveBeenCalledWith(
            appID,
            mockUpdateApplicationRequestDto.underwriterUserIDs,
        );
        expect(applicationQuery.findOne).toHaveBeenLastCalledWith(appID);
        expect(result).toBe(mockApplicationDto);
    });
});
