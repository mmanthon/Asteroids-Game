import { HttpExceptionFilter, initializeSwaggerUI } from '@ignidus/iscx-backend-utils';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { swaggerConfig } from '../config/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const server = app.getHttpAdapter().getInstance();

    server.keepAliveTimeout = 68000; // 65 seconds
    server.headersTimeout = 69000; // must be > keepAliveTimeout

    const configService = app.get(ConfigService);
    const httpExceptionFilter = app.get(HttpExceptionFilter);

    app.enableCors({
        // any subdomain of isceng.net over HTTPS
        // localhost on any port
        origin: [
            /^https:\/\/([\w-]+\.)?isceng\.net$/,
            /^http:\/\/localhost(:\d+)?$/,
            /^https:\/\/([\w-]+\.)?onlinemga\.com$/,
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    const logger = new Logger('Main');

    app.setGlobalPrefix(configService.get<string>('globalApiPrefix'));
    app.useGlobalFilters(httpExceptionFilter);

    initializeSwaggerUI(app, swaggerConfig);

    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    app.use(helmet());

    await app.listen(configService.get<number>('port'), () => {
        logger.log(`Server up and running on port ${configService.get<number>('port')}`);
    });
}
bootstrap();
