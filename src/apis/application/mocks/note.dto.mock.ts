import {
    NoteAuthorRoleEnum,
    NoteCategoryEnum,
    NoteEntityTypeEnum,
    NoteNotificationTypeEnum,
} from '@ignidus/iscx-backend-utils';

import { NoteDto } from '../dto';
import { NoteTypeEnum } from '../enums';

export const mockNoteDto: NoteDto = {
    id: '123456',
    type: NoteTypeEnum.DEFAULT,
    content: 'This is a test note',
    entityType: NoteEntityTypeEnum.APPLICATION,
    entityID: '123',
    category: NoteCategoryEnum.CANCELLATION_CANCELLED,
    notify: [NoteNotificationTypeEnum.PRODUCER],
    createdBy: 'test',
    updatedDate: '2021-01-02',
    createdDate: '2021-01-01',
    author: {
        firstName: 'John',
        lastName: 'Doe',
        role: NoteAuthorRoleEnum.PRODUCER,
    },
    isActive: false,
    isInternal: false,
};
