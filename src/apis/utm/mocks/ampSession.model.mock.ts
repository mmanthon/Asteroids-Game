/* eslint-disable camelcase */
import { SessionModel } from '@ignidus/iscx-backend-utils';

import { mockSessionID } from './constants.mock';

export const mockAmpSession: SessionModel = {
    session_id: mockSessionID,
    data: 'testData',
};
