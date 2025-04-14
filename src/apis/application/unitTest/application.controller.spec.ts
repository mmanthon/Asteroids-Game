import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationController } from '../application.controller';
import { ApplicationQuery } from '../application.query';
import { ApplicationService } from '../application.service';
import { ApplicationUtil } from '../application.util';
import {
    appID,
    mockFindAllResult,
    mockSimplifiedApplicationDto,
    mockUpdateApplicationRequestDto,
    mockUser,
    mockUserRequest,
} from '../mocks';

describe('ApplicationController', () => {
    let controller: ApplicationController;
    let service: ApplicationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationController],
            providers: [
                {
                    provide: ApplicationService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue(mockFindAllResult),
                        findOne: jest.fn().mockResolvedValue(mockSimplifiedApplicationDto),
                        updateOne: jest.fn().mockResolvedValue(mockSimplifiedApplicationDto),
                    },
                },
                { provide: ApplicationQuery, useValue: {} },
                { provide: ApplicationUtil, useValue: {} },
                { provide: ItemEntity, useValue: {} },
            ],
        }).compile();

        controller = module.get<ApplicationController>(ApplicationController);
        service = module.get<ApplicationService>(ApplicationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('Should return all applications', async () => {
        const result = await controller.findAll({});

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual(mockFindAllResult);
    });

    it('Should return one application', async () => {
        const result = await controller.findOne(appID, mockUserRequest);

        expect(service.findOne).toHaveBeenCalledWith(appID, mockUserRequest.user);
        expect(result).toEqual(mockSimplifiedApplicationDto);
    });

    it('Should update an application', async () => {
        const result = await controller.updateOne(appID, mockUpdateApplicationRequestDto, mockUserRequest);

        expect(service.updateOne).toHaveBeenCalledWith(appID, mockUpdateApplicationRequestDto, mockUser);
        expect(result).toEqual(mockSimplifiedApplicationDto);
    });
});
