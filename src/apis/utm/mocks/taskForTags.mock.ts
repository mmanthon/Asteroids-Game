import { AmpEmailActionTypeLabelEnum, TaskStatusEnum } from '@ignidus/iscx-backend-utils';

import { mockAppID, mockUserID } from './constants.mock';

export const mockTaskForTags = {
    appID: mockAppID,
    status: TaskStatusEnum.NOT_STARTED,
    isNew: true,
    assignedUser: { id: mockUserID, fname: 'Test', lname: 'User' },
    companyName: 'Test Company',
    products: [],
    programTypes: [],
    actionType: AmpEmailActionTypeLabelEnum.approval,
    agency: { id: '1', label: 'Test Agency' },
    tags: [],
    groups: [],
    updatedBy: '',
    position: 1,
};
