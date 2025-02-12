import { ItemEntity, ItemModel } from '@ignidus/iscx-backend-utils';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';

import { appID, itemModelMock } from '../../../apis/creditScore/mocks';
import { AppIDValidator } from '../appID.validator';

describe('AppIDValidator', () => {
    let appIDValidator: AppIDValidator;
    let itemEntity: ItemEntity;

    beforeEach(async () => {
        const mockItemEntity = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppIDValidator,
                {
                    provide: ItemEntity,
                    useValue: mockItemEntity,
                },
            ],
        }).compile();

        appIDValidator = module.get<AppIDValidator>(AppIDValidator);
        itemEntity = module.get<ItemEntity>(ItemEntity);
    });

    it('should return the appID if it exists', async () => {
        jest.spyOn(itemEntity, 'findOne').mockResolvedValue(itemModelMock as ItemModel);

        const result = await appIDValidator.transform(appID);

        expect(result).toBe(appID);
        expect(itemEntity.findOne).toHaveBeenCalledWith(appID);
    });

    it('should throw BadRequestException if the appID does not exist', async () => {
        const errorMessage = new BadRequestException(`No application found with id: ${appID}`);

        jest.spyOn(itemEntity, 'findOne').mockResolvedValue(null);

        await expect(appIDValidator.transform(appID)).rejects.toThrow(errorMessage);
        expect(itemEntity.findOne).toHaveBeenCalledWith(appID);
    });
});
