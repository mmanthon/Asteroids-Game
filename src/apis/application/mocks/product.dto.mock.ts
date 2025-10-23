import { ApplicationProductDto } from '../dto';
import { programID, programTypeID } from './constants.mock';

export const mockProductDto: ApplicationProductDto[] = [
    {
        id: '123',
        name: 'Product 1',
        programID: String(programID),
        programTypeID: String(programTypeID),
        carrierName: 'Carrier 1',
        isDirectToConsumer: false,
        isAutoRiskSummarizationEnabled: false,
    },
    {
        id: '321',
        name: 'Product 2',
        programID: String(programID),
        programTypeID: String(programTypeID),
        carrierName: 'Carrier 2',
        isDirectToConsumer: false,
        isAutoRiskSummarizationEnabled: false,
    },
];
