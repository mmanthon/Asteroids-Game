import { UserFeedbackDto } from '../dto';
import { testUserID } from './constants';

export const mockUserFeedbackUpdateResult = {
    isHelpful: false,
    categories: ['Incomplete'],
    additionalDetail: 'Missing docs',
    userID: testUserID,
    timestamp: expect.any(String),
};

export const mockUserFeedbackUpdateResultWithDefaults = {
    isHelpful: true,
    categories: [],
    additionalDetail: '',
    userID: testUserID,
    timestamp: expect.any(String),
};

export const mockUserFeedbackUpdateResultWithUndefined = {
    isHelpful: false,
    categories: [],
    additionalDetail: '',
    userID: testUserID,
    timestamp: expect.any(String),
};

export const mockUserFeedbackWithAllFields: UserFeedbackDto = {
    isHelpful: false,
    categories: ['Incomplete'],
    additionalDetail: 'Missing docs',
};

export const mockUserFeedbackWithDefaults: UserFeedbackDto = {
    isHelpful: true,
};

export const mockUserFeedbackWithUndefined: UserFeedbackDto = {
    isHelpful: false,
    categories: undefined,
    additionalDetail: undefined,
};
