import {
    NoteAuthorRoleEnum,
    NoteCategoryEnum,
    NoteEntityTypeEnum,
    NoteNotificationTypeEnum,
} from '@ignidus/iscx-backend-utils';

import { NoteDto } from '../dto';
import { NoteTypeEnum } from '../enums';
import { contentNote, createdDate, entityID, noteID, updatedDate, userID } from './constants.mock';
import { mockAuthor } from './noteAuthor.dto.mock';

export const mockNoteDto: NoteDto = {
    id: noteID,
    type: NoteTypeEnum.DEFAULT,
    content: contentNote,
    entityType: NoteEntityTypeEnum.APPLICATION,
    entityID,
    category: NoteCategoryEnum.DETAIL_VIEW,
    notify: [NoteNotificationTypeEnum.PRODUCER],
    createdBy: 'John Doe',
    updatedDate,
    createdDate,
    author: {
        firstName: mockAuthor.firstName,
        lastName: mockAuthor.lastName,
        role: NoteAuthorRoleEnum.UNDERWRITER,
    },
    isActive: true,
    isInternal: false,
};

export const mockNoteMarketplaceDto = {
    ...mockNoteDto,
    userID: String(userID),
};
