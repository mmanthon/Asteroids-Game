import { DynamoTaskEntity, EmailTrackingEntity, UserEntity } from '@ignidus/iscx-backend-utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from '@ssut/nestjs-sqs';

import { mockEnqueueRequest } from '../mocks';
import { UtmController } from '../utm.controller';
import { UtmService } from '../utm.service';

describe('UtmController', () => {
    let controller: UtmController;
    let service: UtmService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UtmController],
            providers: [
                { provide: UtmService, useValue: { findAll: jest.fn(), enqueue: jest.fn() } },
                { provide: SqsService, useValue: {} },
                { provide: ConfigService, useValue: {} },
                { provide: JwtService, useValue: {} },
                { provide: DynamoTaskEntity, useValue: {} },
                { provide: EmailTrackingEntity, useValue: {} },
                { provide: UserEntity, useValue: {} },
            ],
        }).compile();

        controller = module.get<UtmController>(UtmController);
        service = module.get<UtmService>(UtmService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('enqueue', () => {
        it('should call service.enqueue', async () => {
            jest.spyOn(service, 'enqueue').mockResolvedValueOnce(undefined);

            await controller.enqueue(mockEnqueueRequest);

            expect(service.enqueue).toHaveBeenCalled();
            expect(service.enqueue).toHaveBeenCalledWith(mockEnqueueRequest);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);

            await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
        });
    });
});
