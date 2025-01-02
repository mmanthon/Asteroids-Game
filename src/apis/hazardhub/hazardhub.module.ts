import { Module } from '@nestjs/common';

import { HazardhubController } from './hazardhub.controller';
import { HazardhubService } from './hazardhub.service';
import { HazardHubUtil } from './hazardhub.util';

@Module({
    controllers: [HazardhubController],
    providers: [HazardhubService, HazardHubUtil],
})
export class HazardhubModule {}
