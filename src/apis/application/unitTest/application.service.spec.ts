import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { ApplicationService } from '../application.service';
import { ApplicationUtil } from '../application.util';

describe('ApplicationService', () => {
    let service: ApplicationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationService,
                { provide: ApplicationQuery, useValue: {} },
                { provide: ApplicationUtil, useValue: {} },
                { provide: ItemEntity, useValue: {} },
            ],
        }).compile();

        service = module.get<ApplicationService>(ApplicationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
