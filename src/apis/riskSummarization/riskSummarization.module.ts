import { Module } from '@nestjs/common';

import { RiskSummarizationController } from './riskSummarization.controller';
import { RiskSummarizationService } from './riskSummarization.service';
import { RiskSummarizationValidationUtil } from './utils';
import { RiskSummarizationUtil } from './utils/riskSummarization.util';

@Module({
    controllers: [RiskSummarizationController],
    providers: [RiskSummarizationService, RiskSummarizationUtil, RiskSummarizationValidationUtil],
})
export class RiskSummarizationModule {}
