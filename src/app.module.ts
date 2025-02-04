import { JwtAuthGuard, LoggerMiddleware, winstonTransports } from '@ignidus/iscx-backend-utils';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';

import configuration from '../config/configuration';
import { envValidationSchema } from '../config/env.validation';
import { AuthModule } from './apis/auth/auth.module';
import { HazardhubModule } from './apis/hazardhub/hazardhub.module';
import { HealthModule } from './apis/health/health.module';
import { AmpModule } from './shared/databases/amp.module';
import { DynamoDBModule } from './shared/databases/dynamodb.module';
import { ExternalModule } from './shared/external/external.module';

@Module({
    imports: [
        HealthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema: envValidationSchema,
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
        AuthModule,
        AmpModule,
        DynamoDBModule,
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
