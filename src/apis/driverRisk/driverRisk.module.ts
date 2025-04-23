import { Module } from '@nestjs/common';

import { DriverRiskController } from './driverRisk.controller';
import { DriverRiskQuery } from './driverRisk.query';
import { DriverRiskService } from './driverRisk.service';
import { DriverRiskUtil } from './driverRisk.util';

@Module({
    controllers: [DriverRiskController],
    providers: [DriverRiskService, DriverRiskUtil, DriverRiskQuery],
})
export class DriverRiskModule {}
