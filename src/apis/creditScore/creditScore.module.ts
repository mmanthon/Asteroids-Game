import { Module } from '@nestjs/common';

import { CreditScoreController } from './creditScore.controller';
import { CreditScoreService } from './creditScore.service';

@Module({
    controllers: [CreditScoreController],
    providers: [CreditScoreService],
})
export class CreditScoreModule {}
