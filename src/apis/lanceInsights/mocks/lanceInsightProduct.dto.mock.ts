import { LanceInsightProductDto } from '../dto';
import { LanceStatusEnum } from '../enums';
import { mockLanceInsightRulesDto } from './lanceInsightRules.dto.mock';

export const mockLanceInsightProductDto: LanceInsightProductDto = {
    productID: '83',
    status: LanceStatusEnum.PASS,
    carrierName: 'Trinity',
    rules: mockLanceInsightRulesDto,
};

export const mockLanceInsightProductDtoFail: LanceInsightProductDto = {
    productID: '84',
    status: LanceStatusEnum.FAIL,
    carrierName: 'Trinity',
    rules: mockLanceInsightRulesDto,
};
