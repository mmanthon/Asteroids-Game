import { Module } from '@nestjs/common';

import { CreditScoreController } from './creditScore.controller';
import { CreditScoreQuery } from './creditScore.query';
import { CreditScoreService } from './creditScore.service';
import { CreditScoreUtil } from './creditScore.util';
import { AmpModule } from '../../shared/databases/amp.module';
import { ExternalModule } from '../../shared/external/external.module';

@Module({
    imports: [AmpModule, ExternalModule],
    controllers: [CreditScoreController],
    providers: [CreditScoreService, CreditScoreQuery, CreditScoreUtil],
})
export class CreditScoreModule {}
