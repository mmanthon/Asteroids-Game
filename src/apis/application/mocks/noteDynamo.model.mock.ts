import { NoteCategoryEnum, NoteDynamoModel, NoteEntityTypeEnum } from '@ignidus/iscx-backend-utils';

import { entityID, noteID, userID } from './constants.mock';

export const mockNoteDynamoModelMissingAuthor: NoteDynamoModel = {
    id: noteID,
    entityType: NoteEntityTypeEnum.APPLICATION,
    entityID: entityID,
    category: NoteCategoryEnum.CANCELLATION_CANCELLED,
    content: '',
    userID: String(userID),
    isActive: false,
    createdBy: null,
    updatedDate: '',
    createdDate: '',
};
