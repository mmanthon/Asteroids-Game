import { NoteAuthorDto, NoteAuthorRoleEnum } from '@ignidus/iscx-backend-utils';

import { userFirstName, userLastName } from './constants.mock';

export const mockAuthor: NoteAuthorDto = {
    firstName: userFirstName,
    lastName: userLastName,
    role: NoteAuthorRoleEnum.UNDERWRITER,
};
