import { AmpEmailActionTypeLabelEnum, TaskStatusEnum } from '@ignidus/iscx-backend-utils';

import { mockAppID, mockCompanyName, mockUserID } from './constants.mock';

export const mockCreateUTMTaskParams = {
    appID: mockAppID,
    status: TaskStatusEnum.NOT_STARTED,
    isNew: true,
    assignedUser: {
        id: mockUserID,
        fname: 'Test',
        lname: 'User',
    },
    companyName: mockCompanyName,
    products: [],
    programTypes: [],
    actionType: AmpEmailActionTypeLabelEnum.approval,
    agency: { id: '1', label: 'Test Agency' },
    tags: [],
    groups: [],
    updatedBy: '',
    position: 1,
};
