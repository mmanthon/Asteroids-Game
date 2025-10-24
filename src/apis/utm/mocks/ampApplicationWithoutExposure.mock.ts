import { mockAmpApplication } from './ampApplication.interface.mock';

export const mockAmpApplicationWithoutExposure = {
    ...mockAmpApplication,
    exposureID: null,
    agencyID: 1,
};
