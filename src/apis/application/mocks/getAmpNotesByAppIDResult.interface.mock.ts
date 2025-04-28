/* eslint-disable camelcase */
import { GetAmpNotesByAppIDResult } from '../interfaces';
import {
    contentNote,
    dateToFormat,
    formattedCreatedDate,
    noteID,
    userFirstName,
    userID,
    userLastName,
} from './constants.mock';

export const mockGetAmpNotesByIDResult: GetAmpNotesByAppIDResult = {
    note_id: Number(noteID),
    user_id: userID,
    first_name: userFirstName,
    last_name: userLastName,
    written: dateToFormat,
    note: contentNote,
    entry_status: 'Active',
    parent_note_id: null,
    sent_to_producer: 1,
    sent_to_underwriter: 0,
    acl_role_id: 6,
};

export const mockGetAmpNotesProducer: GetAmpNotesByAppIDResult = {
    ...mockGetAmpNotesByIDResult,
    note_id: 987,
    written: formattedCreatedDate,
    parent_note_id: 456,
    sent_to_underwriter: 1,
};
export const mockGetAmpNotesWithZeroUser: GetAmpNotesByAppIDResult = {
    ...mockGetAmpNotesByIDResult,
    note: '<script>bad()</script>',
    user_id: 0,
    first_name: null,
    last_name: null,
    sent_to_producer: 0,
    sent_to_underwriter: 0,
};
