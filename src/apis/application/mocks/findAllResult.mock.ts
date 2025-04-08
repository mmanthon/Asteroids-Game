import { FindAllResult } from '../interfaces';
import { mockApplications } from './applicationResponse.mock';

export const mockFindAllResult: FindAllResult = {
    applications: mockApplications,
    currentPage: 1,
    nextPage: null,
    totalPages: 1,
};
