import { mockActionType, mockEmailID } from './constants.mock';
import { EnqueueRequestDto } from '../dto';

export const mockEnqueueRequest: EnqueueRequestDto = {
    emailID: mockEmailID,
    actionType: mockActionType,
};
