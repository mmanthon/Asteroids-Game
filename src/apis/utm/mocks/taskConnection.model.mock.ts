import { TaskWebsocketConnectionStatusEnum, TaskWebsocketConnectionsModel } from '@ignidus/iscx-backend-utils';

import { mockConnectionID, mockCreatedDate, mockIP, mockUpdatedDate, mockUserID } from './constants.mock';

export const mockTaskConnection: TaskWebsocketConnectionsModel = {
    id: mockConnectionID,
    userID: mockUserID,
    ip: mockIP,
    status: TaskWebsocketConnectionStatusEnum.ACTIVE,
    isActive: true,
    updatedDate: mockUpdatedDate,
    createdDate: mockCreatedDate,
};
