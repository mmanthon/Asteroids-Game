import { Module } from '@nestjs/common';

import { UtmController } from './utm.controller';
import { UtmService } from './utm.service';
import { UtmUtil } from './utm.util';

@Module({
    controllers: [UtmController],
    providers: [UtmService, UtmUtil],
})
export class UtmModule {}
