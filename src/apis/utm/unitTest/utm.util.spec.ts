import { AmpEmailActionTypeLabelEnum, DynamoTaskEntity, taskGroupMapping } from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { mockGroupName, mockTaskModel, mockUserID } from '../mocks';
import { UtmUtil } from '../utm.util';

describe('UtmUtil', () => {
    let util: UtmUtil;
    let taskEntity: jest.Mocked<DynamoTaskEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UtmUtil,
                {
                    provide: DynamoTaskEntity,
                    useValue: { findTasksByActionType: jest.fn() },
                },
            ],
        }).compile();

        util = module.get<UtmUtil>(UtmUtil);
        taskEntity = module.get(DynamoTaskEntity) as unknown as jest.Mocked<DynamoTaskEntity>;
    });

    describe('constructResponse', () => {
        it('should default updatedBy to "" and groups to [] when missing', () => {
            const result = util.constructResponse({ ...mockTaskModel, updatedBy: undefined, groups: undefined });

            expect(result.updatedBy).toBe('');
            expect(result.groups).toEqual([]);
        });

        it('should preserve provided updatedBy and groups', () => {
            const result = util.constructResponse({ ...mockTaskModel, groups: [mockGroupName] });

            expect(result.updatedBy).toBe(mockUserID);
            expect(result.groups).toEqual([mockGroupName]);
        });
    });

    describe('getTasksByActionTypes', () => {
        it('fetches and flattens tasks for every action type in the given group', async () => {
            const actionTypes = Object.entries(taskGroupMapping)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
                .filter(([_, mappedGroup]) => mappedGroup === mockGroupName)
                .map(([actionType]) => actionType as AmpEmailActionTypeLabelEnum);

            [mockTaskModel].forEach((task) => {
                taskEntity.findTasksByActionType.mockResolvedValueOnce([task]);
            });

            const result = await util.getTasksByActionTypes([mockGroupName]);

            expect(taskEntity.findTasksByActionType).toHaveBeenCalledTimes(actionTypes.length);
            actionTypes.forEach((type, idx) => {
                expect(taskEntity.findTasksByActionType).toHaveBeenNthCalledWith(idx + 1, type);
            });
            expect(result).toEqual([mockTaskModel]);
        });
    });
});
