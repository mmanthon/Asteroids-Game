import { HttpExceptionFilter } from '@ignidus/iscx-backend-utils';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: false });

    const configService = app.get(ConfigService);

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
    app.useGlobalFilters(new HttpExceptionFilter());
    const config = new DocumentBuilder()
        .setTitle('ISCx Broker Center APIs')
        .addBearerAuth({ name: 'Authorization', type: 'http' })
        .addSecurityRequirements('bearer')
        .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(configService.get<string>('swaggerUrl'), app, document, {
        swaggerOptions: {
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });

    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    app.use(helmet());

    await app.listen(configService.get<number>('port'), () => {
        logger.log(`Server up and running on port ${configService.get<number>('port')}`);
        logger.log(`Swagger UI url ${configService.get<string>('swaggerUrl')}`);
    });
}
bootstrap();
