import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
    @ApiProperty({ description: 'Identifier for the email', example: '123456' })
    id: string;

    @ApiProperty({ description: 'Sender email', example: 'sender@gmail.com' })
    sender: string;

    @ApiProperty({
        description: 'List of recipient email addresses',
        example: ['recipient1@gmail.com', 'recipient2@gmail.com'],
    })
    recipients: string[];

    @ApiProperty({ description: 'Subject of the email', example: 'Important Update' })
    subject: string;

    @ApiProperty({
        description: 'Content of the email (may include HTML)',
        example: '<p>Hi, this is the body email</p>',
    })
    body: string;

    @ApiProperty({ description: 'Timestamp when the email was sent', example: '2025-04-08 14:30' })
    sentAt: string;
}
