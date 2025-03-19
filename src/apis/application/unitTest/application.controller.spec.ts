import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationController } from '../application.controller';
import { ApplicationQuery } from '../application.query';
import { ApplicationService } from '../application.service';
import { ApplicationUtil } from '../application.util';

describe('ApplicationController', () => {
    let controller: ApplicationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationController],
            providers: [
                ApplicationService,
                { provide: ApplicationQuery, useValue: {} },
                { provide: ApplicationUtil, useValue: {} },
                { provide: ItemEntity, useValue: {} },
            ],
        }).compile();

        controller = module.get<ApplicationController>(ApplicationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
