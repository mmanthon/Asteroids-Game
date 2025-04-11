import { FindAllResult } from '../interfaces';
import { mockAmpApplication } from './ampApplication.interface.mock';

export const mockFindAllResult: FindAllResult = {
    applications: [mockAmpApplication],
    currentPage: 1,
    nextPage: null,
    totalPages: 1,
};
