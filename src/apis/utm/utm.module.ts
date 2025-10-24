import { Module } from '@nestjs/common';

import { UtmController } from './utm.controller';
import { UtmQuery } from './utm.query';
import { UtmService } from './utm.service';
import { UtmUtil } from './utm.util';

@Module({
    controllers: [UtmController],
    providers: [UtmService, UtmUtil, UtmQuery],
})
export class UtmModule {}
