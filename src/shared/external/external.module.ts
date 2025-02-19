import { Global, Module } from '@nestjs/common';

import { AmpApiIntegration, MvrIntegrationService } from '.';

@Global()
@Module({
    providers: [AmpApiIntegration, MvrIntegrationService],
    exports: [AmpApiIntegration, MvrIntegrationService],
})
export class ExternalModule {}
