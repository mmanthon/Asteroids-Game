import { DynamoTaskEntity, EmailTrackingEntity, SessionEntity, UserEntity } from '@ignidus/iscx-backend-utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { SessionByIDGuard } from '../../../shared/guards';
import { mockCreateTaskRequest } from '../mocks';
import { UtmController } from '../utm.controller';
import { UtmService } from '../utm.service';

describe('UtmController', () => {
    let controller: UtmController;
    let service: UtmService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UtmController],
            providers: [
                { provide: UtmService, useValue: { findAll: jest.fn(), create: jest.fn() } },
                { provide: ConfigService, useValue: {} },
                { provide: JwtService, useValue: {} },
                { provide: DynamoTaskEntity, useValue: {} },
                { provide: EmailTrackingEntity, useValue: {} },
                { provide: UserEntity, useValue: {} },
                { provide: SessionEntity, useValue: {} },
                { provide: SessionByIDGuard, useValue: {} },
            ],
        }).compile();

        controller = module.get<UtmController>(UtmController);
        service = module.get<UtmService>(UtmService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            jest.spyOn(service, 'create').mockResolvedValueOnce(undefined);

            await controller.create(mockCreateTaskRequest);

            expect(service.create).toHaveBeenCalled();
            expect(service.create).toHaveBeenCalledWith(mockCreateTaskRequest);
        });
    });

    describe('enqueue', () => {
        it('should call service.create', async () => {
            jest.spyOn(service, 'create').mockResolvedValueOnce(undefined);

            await controller.enqueue(mockCreateTaskRequest);

            expect(service.create).toHaveBeenCalled();
            expect(service.create).toHaveBeenCalledWith(mockCreateTaskRequest);
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
