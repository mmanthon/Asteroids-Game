import { JwtAuthGuard, LoggerMiddleware, winstonTransports } from '@ignidus/iscx-backend-utils';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';

import { HealthModule } from './apis/health/health.module';
import { TemplateModule } from './apis/template/template.module';
import { AmpModule } from './databases/amp/amp.module';
import { DynamoDBModule } from './databases/dynamodb/dynamodb.module';
import { UtilsModule } from './utils/utils.module';
import awsConfig from '../config/aws.config';
import commonConfig from '../config/common.config';
import databaseConfig from '../config/database.config';
import jwtConfig from '../config/jwt.config';

@Module({
    imports: [
        HealthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [commonConfig, databaseConfig, awsConfig, jwtConfig],
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
        CacheModule.register(),
        WinstonModule.forRoot({
            transports: [...winstonTransports],
        }),
        TemplateModule,
        UtilsModule,
        AmpModule,
        DynamoDBModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
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
