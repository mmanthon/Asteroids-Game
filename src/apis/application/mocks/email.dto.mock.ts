import { EmailDto } from '../dto';

export const mockEmailDto: EmailDto = {
    id: '123456',
    sender: 'sender@gmail.com',
    recipients: ['recipient1@gmail.com', 'recipient2@gmail.com'],
    subject: 'Test Subject',
    body: '<p>Hi, this is the body email</p>',
    sentAt: '2025-04-08 14:30',
};
