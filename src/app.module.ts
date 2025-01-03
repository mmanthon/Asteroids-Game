import { JwtAuthGuard, LoggerMiddleware, winstonTransports } from '@ignidus/iscx-backend-utils';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';

import { HazardhubModule } from './apis/hazardhub/hazardhub.module';
import { HealthModule } from './apis/health/health.module';
import config from './config';
import { ExternalModule } from './external/external.module';
import { AmpModule } from './shared/databases/amp.module';
import { UtilsModule } from './shared/utils/utils.module';

@Module({
    imports: [
        HealthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
        }),
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({ ...config.get<object>('jwt') }),
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                ...config.get<object>('rateLimit'),
            }),
        }),
        WinstonModule.forRoot({
            transports: [...winstonTransports],
        }),
        AmpModule,
        UtilsModule,
        HazardhubModule,
        ExternalModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
