import { AmpEmailServiceStatusEnum, EmailTrackingModel } from '@ignidus/iscx-backend-utils';

/* eslint-disable camelcase */
export const mockEmailTrackingModel: EmailTrackingModel = {
    email_tracking_id: 1,
    user_id: 42,
    sent_at: '2025-04-23T14:30:00Z',
    subject: 'Welcome to Acme!',
    to_address: 'jane.doe@example.com',
    from_address: 'no-reply@acme.com',
    bcc_address: 'audit@acme.com',
    body_html: '<p>Hello Jane, welcome aboard!</p>',
    body_text: 'Hello Jane, welcome aboard!',
    action: 'delivered',
    entity_table: 'users',
    entity_id: 42,
    mail_service: 'SES',
    mail_service_status: AmpEmailServiceStatusEnum.SUCCESS,
};
