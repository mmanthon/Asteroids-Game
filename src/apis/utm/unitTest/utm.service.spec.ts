import { DynamoTaskEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import {
    mockAmpApplication,
    mockCreateTaskRequest,
    mockCreateUTMTaskParams,
    mockEmailTrackingModel,
    mockGroupName,
    mockTaskModel,
    utmResponseDto,
} from '../mocks';
import { UtmQuery } from '../utm.query';
import { UtmService } from '../utm.service';
import { UtmUtil } from '../utm.util';

describe('UtmService', () => {
    let service: UtmService;
    let taskEntity: DynamoTaskEntity;
    let utmUtil: UtmUtil;
    let utmQuery: UtmQuery;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UtmService,
                {
                    provide: DynamoTaskEntity,
                    useValue: { findAll: jest.fn(), create: jest.fn() },
                },
                {
                    provide: UtmUtil,
                    useValue: {
                        constructResponse: jest.fn(),
                        getTasksByActionTypes: jest.fn(),
                        validateEmailRecord: jest.fn(),
                        buildTaskPayload: jest.fn(),
                        addGroups: jest.fn(),
                        addTags: jest.fn(),
                        addLinkedProducts: jest.fn(),
                        addLinkedProgramTypes: jest.fn(),
                        autoAssign: jest.fn(),
                        sendTasksToWebsocket: jest.fn(),
                    },
                },
                {
                    provide: UtmQuery,
                    useValue: {
                        getApplicationByID: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UtmService>(UtmService);
        taskEntity = module.get<DynamoTaskEntity>(DynamoTaskEntity);
        utmUtil = module.get<UtmUtil>(UtmUtil);
        utmQuery = module.get<UtmQuery>(UtmQuery);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(taskEntity).toBeDefined();
        expect(utmUtil).toBeDefined();
        expect(utmQuery).toBeDefined();
    });

    describe('create', () => {
        it('should create task when application status is valid', async () => {
            jest.spyOn(utmUtil, 'validateEmailRecord').mockResolvedValue(mockEmailTrackingModel);
            jest.spyOn(utmQuery, 'getApplicationByID').mockResolvedValue(mockAmpApplication);
            jest.spyOn(utmUtil, 'buildTaskPayload').mockReturnValue(mockCreateUTMTaskParams);
            jest.spyOn(utmUtil, 'addGroups').mockImplementation();
            jest.spyOn(utmUtil, 'addTags').mockResolvedValue();
            jest.spyOn(utmUtil, 'addLinkedProducts').mockResolvedValue();
            jest.spyOn(utmUtil, 'addLinkedProgramTypes').mockResolvedValue();
            jest.spyOn(utmUtil, 'autoAssign').mockResolvedValue();
            jest.spyOn(taskEntity, 'create').mockResolvedValue(mockTaskModel);
            jest.spyOn(utmUtil, 'sendTasksToWebsocket').mockResolvedValue();

            await service.create(mockCreateTaskRequest);

            expect(utmUtil.validateEmailRecord).toHaveBeenCalledWith(mockCreateTaskRequest.emailID);
            expect(utmQuery.getApplicationByID).toHaveBeenCalledWith('123');
            expect(utmUtil.buildTaskPayload).toHaveBeenCalledWith(mockAmpApplication, mockCreateTaskRequest.actionType);
            expect(utmUtil.addGroups).toHaveBeenCalledWith(mockCreateUTMTaskParams);
            expect(utmUtil.addTags).toHaveBeenCalledWith(mockAmpApplication, mockCreateUTMTaskParams, 'test subject');
            expect(utmUtil.addLinkedProducts).toHaveBeenCalledWith(mockCreateUTMTaskParams);
            expect(utmUtil.addLinkedProgramTypes).toHaveBeenCalledWith(mockCreateUTMTaskParams);
            expect(utmUtil.autoAssign).toHaveBeenCalledWith(mockCreateUTMTaskParams);
            expect(taskEntity.create).toHaveBeenCalledWith(mockCreateUTMTaskParams);
            expect(utmUtil.sendTasksToWebsocket).toHaveBeenCalledWith([mockTaskModel]);
        });

        it('should skip task creation when application status is excluded', async () => {
            const mockApplicationWithExcludedStatus = { ...mockAmpApplication, statusID: 2 };

            jest.spyOn(utmUtil, 'validateEmailRecord').mockResolvedValue(mockEmailTrackingModel);
            jest.spyOn(utmQuery, 'getApplicationByID').mockResolvedValue(mockApplicationWithExcludedStatus);
            jest.spyOn(utmUtil, 'buildTaskPayload').mockReturnValue(mockCreateUTMTaskParams);
            jest.spyOn(utmUtil, 'addGroups').mockImplementation();
            jest.spyOn(utmUtil, 'addTags').mockResolvedValue();
            jest.spyOn(utmUtil, 'addLinkedProducts').mockResolvedValue();
            jest.spyOn(utmUtil, 'addLinkedProgramTypes').mockResolvedValue();
            jest.spyOn(utmUtil, 'autoAssign').mockResolvedValue();
            jest.spyOn(taskEntity, 'create').mockResolvedValue(mockTaskModel);
            jest.spyOn(utmUtil, 'sendTasksToWebsocket').mockResolvedValue();

            await service.create(mockCreateTaskRequest);

            expect(utmUtil.validateEmailRecord).toHaveBeenCalledWith(mockCreateTaskRequest.emailID);
            expect(utmQuery.getApplicationByID).toHaveBeenCalledWith('123');
            expect(utmUtil.buildTaskPayload).not.toHaveBeenCalled();
            expect(taskEntity.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should call taskEntity.findAll when no filters', async () => {
            jest.spyOn(taskEntity, 'findAll').mockResolvedValue([mockTaskModel]);
            jest.spyOn(utmUtil, 'constructResponse').mockReturnValue(utmResponseDto);

            const result = await service.findAll();

            expect(result).toEqual([utmResponseDto]);
            expect(utmUtil.constructResponse).toHaveBeenCalledWith(mockTaskModel);
            expect(taskEntity.findAll).toHaveBeenCalled();
        });

        it('should filter tasks by group', async () => {
            jest.spyOn(utmUtil, 'getTasksByActionTypes').mockResolvedValue([mockTaskModel]);
            jest.spyOn(utmUtil, 'constructResponse').mockReturnValue(utmResponseDto);

            const result = await service.findAll({ groups: [mockGroupName] });

            expect(result).toEqual([utmResponseDto]);
            expect(utmUtil.getTasksByActionTypes).toHaveBeenCalledWith([mockGroupName]);
            expect(utmUtil.constructResponse).toHaveBeenCalledWith(mockTaskModel);
        });
    });
});
