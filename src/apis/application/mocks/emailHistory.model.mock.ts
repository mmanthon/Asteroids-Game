import { EmailEntityEnum, EmailProviderEnum, EmailStatusEnum } from '@ignidus/iscx-backend-utils';

export const mockEmailHistoryModel = {
    id: '123456',
    sender: 'sender@example.com',
    recipients: 'user1@example.com,user2@example.com',
    subject: 'Test Subject',
    body: 'This is a body',
    sentAt: '2025-01-01T00:00:00Z',
    status: EmailStatusEnum.SENT,
    entityType: EmailEntityEnum.APPLICATION,
    entityID: '1234',
    mailService: EmailProviderEnum.AWS_SES,
    mailServiceRefID: 'ref-123',
};
