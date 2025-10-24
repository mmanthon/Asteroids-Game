/* eslint-disable camelcase */
import {
    AmpEmailActionTypeLabelEnum,
    DynamoTaskEntity,
    EmailTrackingEntity,
    ItemLinkedProductEntity,
    TaskStatusEnum,
    UtmGroupEnum,
} from '@ignidus/iscx-backend-utils';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@aws-sdk/client-lambda', () => ({
    Lambda: jest.fn().mockImplementation(() => ({
        invoke: jest.fn().mockResolvedValue({}),
    })),
}));

import {
    mockActionType,
    mockAmpAgenciesToAgencyGroup,
    mockAmpApplication,
    mockAmpApplicationWithExposure,
    mockAmpApplicationWithoutExposure,
    mockAmpExposureData,
    mockAppID,
    mockBaseTask,
    mockCreateUTMTaskParams,
    mockEmailID,
    mockEmailTrackingModel,
    mockGroupName,
    mockInProgressTask,
    mockTaskDynamoModel,
    mockTaskForTags,
    mockUserID,
    mockWebsocketTask,
} from '../mocks';
import { UtmQuery } from '../utm.query';
import { UtmUtil } from '../utm.util';

describe('UtmUtil', () => {
    let util: UtmUtil;
    let taskEntity: jest.Mocked<DynamoTaskEntity>;
    let emailTrackingEntity: jest.Mocked<EmailTrackingEntity>;
    let itemLinkedProductsEntity: jest.Mocked<ItemLinkedProductEntity>;
    let utmQuery: jest.Mocked<UtmQuery>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UtmUtil,
                {
                    provide: DynamoTaskEntity,
                    useValue: {
                        findTasksByActionType: jest.fn(),
                        findAllByAppID: jest.fn(),
                    },
                },
                {
                    provide: EmailTrackingEntity,
                    useValue: { getEmailRecordByID: jest.fn() },
                },
                {
                    provide: ItemLinkedProductEntity,
                    useValue: { getRecordsByAppID: jest.fn() },
                },
                {
                    provide: UtmQuery,
                    useValue: {
                        getLinkedProgramType: jest.fn(),
                        getDepositRequiredAgencies: jest.fn(),
                        getExposureData: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn() },
                },
            ],
        }).compile();

        util = module.get<UtmUtil>(UtmUtil);
        taskEntity = module.get(DynamoTaskEntity) as unknown as jest.Mocked<DynamoTaskEntity>;
        emailTrackingEntity = module.get(EmailTrackingEntity) as unknown as jest.Mocked<EmailTrackingEntity>;
        itemLinkedProductsEntity = module.get(
            ItemLinkedProductEntity,
        ) as unknown as jest.Mocked<ItemLinkedProductEntity>;
        utmQuery = module.get(UtmQuery) as unknown as jest.Mocked<UtmQuery>;
        configService = module.get(ConfigService) as unknown as jest.Mocked<ConfigService>;
    });

    describe('constructResponse', () => {
        it('should default updatedBy to "" and groups to [] when missing', () => {
            const task = { ...mockTaskDynamoModel, updatedBy: undefined, groups: undefined };
            const result = util.constructResponse(task);

            expect(result.updatedBy).toBe('');
            expect(result.groups).toEqual([]);
        });

        it('should preserve provided updatedBy and groups', () => {
            const task = { ...mockTaskDynamoModel, groups: [mockGroupName] };
            const result = util.constructResponse(task);

            expect(result.updatedBy).toBe(mockUserID);
            expect(result.groups).toEqual([mockGroupName]);
        });
    });

    describe('getTasksByActionTypes', () => {
        it('fetches and flattens tasks for every action type in the given group', async () => {
            taskEntity.findTasksByActionType.mockResolvedValue([mockTaskDynamoModel]);

            const result = await util.getTasksByActionTypes([mockGroupName]);

            expect(taskEntity.findTasksByActionType).toHaveBeenCalled();
            expect(result).toContainEqual(mockTaskDynamoModel);
        });
    });

    describe('validateEmailRecord', () => {
        it('should return email record when found', async () => {
            emailTrackingEntity.getEmailRecordByID.mockResolvedValue(mockEmailTrackingModel);

            const result = await util.validateEmailRecord(mockEmailID);

            expect(result).toEqual(mockEmailTrackingModel);
            expect(emailTrackingEntity.getEmailRecordByID).toHaveBeenCalledWith(Number(mockEmailID));
        });

        it('should throw NotFoundException when email record not found', async () => {
            emailTrackingEntity.getEmailRecordByID.mockResolvedValue(null);

            await expect(util.validateEmailRecord(mockEmailID)).rejects.toThrow(
                new NotFoundException(`Email record with id ${mockEmailID} not found`),
            );
        });
    });

    describe('autoAssign', () => {
        it('should not auto assign for pending bind action type', async () => {
            const task = { ...mockCreateUTMTaskParams, actionType: AmpEmailActionTypeLabelEnum.pendingBind };

            await util.autoAssign(task);

            expect(taskEntity.findAllByAppID).not.toHaveBeenCalled();
        });

        it('should not auto assign when no in progress task found', async () => {
            const task = { ...mockCreateUTMTaskParams, actionType: AmpEmailActionTypeLabelEnum.approval };

            taskEntity.findAllByAppID.mockResolvedValue([]);

            await util.autoAssign(task);

            expect(taskEntity.findAllByAppID).toHaveBeenCalledWith(mockAppID);
        });

        it('should auto assign when in progress task found', async () => {
            const task = { ...mockCreateUTMTaskParams, actionType: AmpEmailActionTypeLabelEnum.approval };

            taskEntity.findAllByAppID.mockResolvedValue([mockInProgressTask]);

            await util.autoAssign(task);

            expect(task.assignedUser).toEqual({ id: 'user1', fname: 'Test', lname: 'User' });
            expect(task.status).toBe(TaskStatusEnum.IN_PROGRESS);
        });
    });

    describe('addLinkedProducts', () => {
        it('should add linked products to task', async () => {
            const linkedProducts = [{ product_id: 1, name: 'Product 1' }];
            const task = { ...mockBaseTask, products: [] };

            itemLinkedProductsEntity.getRecordsByAppID.mockResolvedValue(linkedProducts);

            await util.addLinkedProducts(task);

            expect(task.products).toEqual([{ id: '1', label: 'Product 1' }]);
        });
    });

    describe('addLinkedProgramTypes', () => {
        it('should add linked program types to task', async () => {
            const program = { programTypeID: 1, programTypeName: 'Program 1' };
            const task = { ...mockBaseTask, products: [{ id: '1', label: 'Product 1' }], programTypes: [] };

            utmQuery.getLinkedProgramType.mockResolvedValue(program);

            await util.addLinkedProgramTypes(task);

            expect(task.programTypes).toEqual([{ id: '1', label: 'Program 1' }]);
        });

        it('should skip when program not found', async () => {
            const task = { ...mockBaseTask, products: [{ id: '1', label: 'Product 1' }], programTypes: [] };

            utmQuery.getLinkedProgramType.mockResolvedValue(null);

            await util.addLinkedProgramTypes(task);

            expect(task.programTypes).toEqual([]);
        });
    });

    describe('addGroups', () => {
        it('should add PRE_BIND group for specific action types', () => {
            const baseTask = mockBaseTask;

            const task1 = { ...baseTask, actionType: AmpEmailActionTypeLabelEnum.pendingBind };

            util.addGroups(task1);
            expect(task1.groups).toContain(UtmGroupEnum.PRE_BIND);

            const task2 = { ...baseTask, actionType: AmpEmailActionTypeLabelEnum.approval };

            util.addGroups(task2);
            expect(task2.groups).toContain(UtmGroupEnum.PRE_BIND);

            const task3 = { ...baseTask, actionType: AmpEmailActionTypeLabelEnum.note };

            util.addGroups(task3);
            expect(task3.groups).toContain(UtmGroupEnum.PRE_BIND);

            const task4 = { ...baseTask, actionType: AmpEmailActionTypeLabelEnum.upload };

            util.addGroups(task4);
            expect(task4.groups).toContain(UtmGroupEnum.PRE_BIND);

            const task5 = { ...baseTask, actionType: AmpEmailActionTypeLabelEnum.uwBindReview };

            util.addGroups(task5);
            expect(task5.groups).toContain(UtmGroupEnum.PRE_BIND);
        });
    });

    describe('sendTasksToWebsocket', () => {
        it('should invoke lambda function', async () => {
            configService.get.mockReturnValue('test-function');

            await util.sendTasksToWebsocket([mockWebsocketTask]);

            expect(configService.get).toHaveBeenCalledWith('sendTasksToWSFunctionName');
        });
    });

    describe('addTags', () => {
        it('should add claims tag when losses exist', async () => {
            const subject = 'test';

            utmQuery.getExposureData.mockResolvedValue(mockAmpExposureData);
            utmQuery.getDepositRequiredAgencies.mockResolvedValue([mockAmpAgenciesToAgencyGroup]);

            await util.addTags(mockAmpApplicationWithExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('Claims');
        });

        it('should add deposit required tag', async () => {
            const subject = 'test';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([mockAmpAgenciesToAgencyGroup]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('Deposit required');
        });

        it('should add priority agency tag', async () => {
            const subject = 'test [6065]';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('priority_agency');
        });

        it('should add ccis tag', async () => {
            const subject = 'test [2237]';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('ccis');
        });

        it('should add gaslamp tag', async () => {
            const subject = 'test [7362]';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('gaslamp');
        });

        it('should add post bind upload tag', async () => {
            const subject = 'test [POSTBIND]';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('post_bind_upload');
        });

        it('should add renewal tag', async () => {
            const subject = 'test [REN]';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('Renewal');
        });

        it('should add PremRank1 tag', async () => {
            const subject = 'test [PREMRANK1]';

            utmQuery.getDepositRequiredAgencies.mockResolvedValue([]);

            await util.addTags(mockAmpApplicationWithoutExposure, mockTaskForTags, subject);

            expect(mockTaskForTags.tags).toContain('PremRank1');
        });
    });

    describe('buildTaskPayload', () => {
        it('should build task payload correctly', () => {
            const result = util.buildTaskPayload(mockAmpApplication, mockActionType);

            expect(result.appID).toBe(mockAppID);
            expect(result.status).toBe(TaskStatusEnum.NOT_STARTED);
            expect(result.isNew).toBe(true);
            expect(result.companyName).toBe(mockAmpApplication.insuredCompanyName);
            expect(result.actionType).toBe(AmpEmailActionTypeLabelEnum.approval);
        });
    });
});
