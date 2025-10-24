import { AmpEmailActionTypeLabelEnum, TaskStatusEnum } from '@ignidus/iscx-backend-utils';

import {
    mockAgencyID,
    mockAppID,
    mockCompanyName,
    mockCreatedDate,
    mockTaskID,
    mockUpdatedDate,
    mockUserID,
} from './constants.mock';

export const mockTaskDynamoModel = {
    id: mockTaskID,
    status: TaskStatusEnum.NOT_STARTED,
    appID: mockAppID,
    isNew: true,
    assignedUser: { id: mockUserID, fname: 'Test', lname: 'User' },
    products: [],
    agency: { id: mockAgencyID, label: 'Test Agency' },
    programTypes: [],
    tags: [],
    isArchived: false,
    position: 0,
    updatedBy: mockUserID,
    actionType: AmpEmailActionTypeLabelEnum.approval,
    companyName: mockCompanyName,
    updatedDate: mockUpdatedDate,
    createdDate: mockCreatedDate,
};
