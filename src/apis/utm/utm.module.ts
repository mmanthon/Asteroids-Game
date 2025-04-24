import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';

import { UtmController } from './utm.controller';
import { UtmService } from './utm.service';
import { UtmUtil } from './utm.util';

@Module({
    imports: [
        SqsModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    producers: [{ ...config.get('utmQueue') }],
                };
            },
        }),
    ],
    controllers: [UtmController],
    providers: [UtmService, UtmUtil],
})
export class UtmModule {}
