import { Module } from '@nestjs/common';

import { HazardhubController } from './hazardhub.controller';
import { HazardHubQuery } from './hazardhub.query';
import { HazardhubService } from './hazardhub.service';
import { HazardHubUtil } from './hazardhub.util';

@Module({
    controllers: [HazardhubController],
    providers: [HazardhubService, HazardHubUtil, HazardHubQuery],
})
export class HazardhubModule {}
