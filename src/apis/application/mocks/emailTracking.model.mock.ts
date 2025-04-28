/* eslint-disable camelcase */
import { EmailTrackingModel } from '@ignidus/iscx-backend-utils';

import { emailTrackingID } from './constants.mock';
import { mockEmailDto } from './email.dto.mock';

export const mockEmailTrackingModel: EmailTrackingModel[] = [
    {
        email_tracking_id: emailTrackingID,
        from_address: mockEmailDto.sender,
        to_address: mockEmailDto.recipients.join(','),
        subject: mockEmailDto.subject,
        body_html: mockEmailDto.body,
        sent_at: mockEmailDto.sentAt,
    },
];
