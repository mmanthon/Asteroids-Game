import { Module } from '@nestjs/common';

import { LanceInsightsController } from './lanceInsights.controller';
import { LanceInsightsQuery } from './lanceInsights.query';
import { LanceInsightsService } from './lanceInsights.service';
import { LanceInsightsUtil } from './lanceInsights.util';

@Module({
    controllers: [LanceInsightsController],
    providers: [LanceInsightsService, LanceInsightsUtil, LanceInsightsQuery],
})
export class LanceInsightsModule {}
