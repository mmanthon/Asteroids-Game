import { DynamoTaskEntity, EmailTrackingEntity } from '@ignidus/iscx-backend-utils';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from '@ssut/nestjs-sqs';

import {
    mockEmailTrackingModel,
    mockEnqueueName,
    mockEnqueueRequest,
    mockGroupName,
    mockTaskModel,
    utmResponseDto,
} from '../mocks';
import { UtmService } from '../utm.service';
import { UtmUtil } from '../utm.util';

describe('UtmService', () => {
    let service: UtmService;
    let taskEntity: DynamoTaskEntity;
    let emailTrackingEntity: EmailTrackingEntity;
    let utmUtil: UtmUtil;
    let configService: ConfigService;
    let sqsService: SqsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UtmService,
                {
                    provide: DynamoTaskEntity,
                    useValue: { findAll: jest.fn(), findTasksByActionType: jest.fn() },
                },
                { provide: EmailTrackingEntity, useValue: { getEmailRecordByID: jest.fn() } },
                {
                    provide: UtmUtil,
                    useValue: {
                        constructResponse: jest.fn(),
                        getTasksByActionTypes: jest.fn(),
                    },
                },
                { provide: SqsService, useValue: { send: jest.fn() } },
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();

        service = module.get<UtmService>(UtmService);
        taskEntity = module.get<DynamoTaskEntity>(DynamoTaskEntity);
        emailTrackingEntity = module.get<EmailTrackingEntity>(EmailTrackingEntity);
        utmUtil = module.get<UtmUtil>(UtmUtil);
        configService = module.get<ConfigService>(ConfigService);
        sqsService = module.get<SqsService>(SqsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(taskEntity).toBeDefined();
        expect(emailTrackingEntity).toBeDefined();
        expect(utmUtil).toBeDefined();
        expect(configService).toBeDefined();
        expect(sqsService).toBeDefined();
    });

    describe('enqueue', () => {
        it('should send a message to the correct SQS queue', async () => {
            jest.spyOn(emailTrackingEntity, 'getEmailRecordByID').mockResolvedValue(mockEmailTrackingModel);
            jest.spyOn(configService, 'get').mockReturnValue(mockEnqueueName);
            jest.spyOn(sqsService, 'send').mockResolvedValue(undefined);

            await service.enqueue(mockEnqueueRequest);

            expect(sqsService.send).toHaveBeenCalledWith(
                mockEnqueueName,
                expect.objectContaining({
                    body: mockEnqueueRequest,
                }),
            );
        });

        it('should throw an error if email record is not found', async () => {
            jest.spyOn(emailTrackingEntity, 'getEmailRecordByID').mockResolvedValue(null);

            await expect(service.enqueue(mockEnqueueRequest)).rejects.toThrowError(
                new BadRequestException('Email record not found'),
            );
        });
    });

    describe('findAll', () => {
        it('should call taskEntity.findAll', async () => {
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
