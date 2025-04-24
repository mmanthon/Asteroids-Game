import { TaskStatusEnum } from '@ignidus/iscx-backend-utils';

import {
    mockActionType,
    mockAgencyID,
    mockAppID,
    mockCompanyName,
    mockCreatedDate,
    mockLabel,
    mockProgramTypeID,
    mockTaskID,
    mockUpdatedDate,
    mockUserFname,
    mockUserID,
    mockUserLname,
} from './constants.mock';
import { TaskAgencyDto, TaskAssignedUserDto, TaskProgramTypeDto, UtmResponseDto } from '../dto';

export const testAgency: TaskAgencyDto = {
    id: mockAgencyID,
    label: mockLabel,
};

export const testAssignedUser: TaskAssignedUserDto = {
    id: mockUserID,
    fname: mockUserFname,
    lname: mockUserLname,
};

export const testProgramTypes: TaskProgramTypeDto = {
    id: mockProgramTypeID,
    label: mockLabel,
};

export const utmResponseDto: UtmResponseDto = {
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
    groups: [],
    updatedBy: mockUserID,
    actionType: mockActionType,
    companyName: mockCompanyName,
    updatedDate: mockUpdatedDate,
    createdDate: mockCreatedDate,
};
