import { Module } from '@nestjs/common';

import { ApplicationController } from './application.controller';
import { ApplicationQuery } from './application.query';
import { ApplicationService } from './application.service';
import { ApplicationUtil } from './application.util';

@Module({
    controllers: [ApplicationController],
    providers: [ApplicationService, ApplicationQuery, ApplicationUtil],
})
export class ApplicationModule {}
