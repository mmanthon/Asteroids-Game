import { LanceInsightsResponseDto } from '../dto';
import { LanceStatusEnum } from '../enums';
import { mockLanceInsightProductDto, mockLanceInsightProductDtoFail } from './lanceInsightProduct.dto.mock';

export const mockLanceInsightsResponseDto: LanceInsightsResponseDto = {
    appID: '3044917',
    status: LanceStatusEnum.PASS,
    timestamp: '2021-07-13T19:40:00.000Z',
    products: [mockLanceInsightProductDto],
};

export const mockLanceInsightsResponseDtoFail: LanceInsightsResponseDto = {
    appID: '3044918',
    status: LanceStatusEnum.FAIL,
    timestamp: '2021-07-13T19:40:00.000Z',
    products: [mockLanceInsightProductDtoFail],
};
