import { Global, Module } from '@nestjs/common';

import { AmpApiIntegration } from '.';

@Global()
@Module({
    providers: [AmpApiIntegration],
    exports: [AmpApiIntegration],
})
export class ExternalModule {}
