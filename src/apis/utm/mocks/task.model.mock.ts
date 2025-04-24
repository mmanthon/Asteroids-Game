import { TaskDynamoModel, TaskStatusEnum } from '@ignidus/iscx-backend-utils';

import {
    mockActionType,
    mockAppID,
    mockCompanyName,
    mockCreatedDate,
    mockTaskID,
    mockUpdatedDate,
    mockUserID,
} from './constants.mock';
import { testAgency, testAssignedUser, testProgramTypes } from './utmResponse.dto.mock';

export const mockTaskModel: TaskDynamoModel = {
    id: mockTaskID,
    status: TaskStatusEnum.NOT_STARTED,
    appID: mockAppID,
    isNew: true,
    assignedUser: testAssignedUser,
    products: [],
    agency: testAgency,
    programTypes: [testProgramTypes],
    tags: [],
    isArchived: false,
    position: 0,
    updatedBy: mockUserID,
    actionType: mockActionType,
    companyName: mockCompanyName,
    updatedDate: mockUpdatedDate,
    createdDate: mockCreatedDate,
};
