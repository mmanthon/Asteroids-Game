import {
    AmpEmailActionTypeLabelEnum,
    DynamoTaskEntity,
    TaskDynamoModel,
    UtmGroupEnum,
    taskGroupMapping,
} from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { UtmResponseDto } from './dto';

@Injectable()
export class UtmUtil {
    constructor(private readonly taskEntity: DynamoTaskEntity) {}

    /**
     * @description Construct response
     * @param {TaskDynamoModel} task
     * @returns {UtmResponseDto}
     */
    constructResponse(task: TaskDynamoModel): UtmResponseDto {
        return {
            ...task,
            updatedBy: task.updatedBy || '',
            groups: task.groups || [],
        };
    }

    /**
     * @description Get tasks by action types
     * @param {UtmGroupEnum[]} groups
     * @returns {Promise<TaskDynamoModel[]>}
     */
    async getTasksByActionTypes(groups: UtmGroupEnum[]): Promise<TaskDynamoModel[]> {
        const tasks = await Promise.all(
            groups.flatMap((group) => {
                const actionTypes = this.getActionTypesByGroup(group);

                return actionTypes.map((actionType) =>
                    this.taskEntity.findTasksByActionType(actionType as AmpEmailActionTypeLabelEnum),
                );
            }),
        );

        return tasks.flat();
    }

    /**
     * @description Get action types by group
     * @param {UtmGroupEnum} group
     * @returns {string[]}
     */
    private getActionTypesByGroup(group: UtmGroupEnum): string[] {
        return (
            Object.entries(taskGroupMapping)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
                .filter(([_, mappedGroup]) => mappedGroup === group)
                .map(([actionType]) => actionType)
        );
    }
}
