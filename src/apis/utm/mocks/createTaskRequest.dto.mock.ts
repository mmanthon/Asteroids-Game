import { mockActionType, mockEmailID } from './constants.mock';
import { CreateTaskRequestDto } from '../dto';

export const mockCreateTaskRequest: CreateTaskRequestDto = {
    emailID: mockEmailID,
    actionType: mockActionType,
};
