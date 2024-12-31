import { HttpExceptionFilter } from '@ignidus/iscx-backend-utils';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { eventContext } from 'aws-serverless-express/middleware';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

export class ApplicationSetup {
    private app: INestApplication;
    private configService: ConfigService;
    private logger = new Logger('Main');

    constructor(app: INestApplication) {
        this.app = app;
        this.configService = app.get(ConfigService);
    }

    async lambda(): Promise<void> {
        this.app.use(eventContext());
        this.globalConfigurations();
        await this.setupSwagger();
        await this.app.init();
    }

    async server(): Promise<void> {
        this.globalConfigurations();
        await this.setupSwagger();
        await this.app.listen(this.configService.get<number>('port'), () => {
            this.logger.log(`Server up and running on port ${this.configService.get<number>('port')}`);
            this.logger.log(`Swagger UI url ${this.configService.get<string>('swaggerUrl')}`);
        });
    }

    globalConfigurations(): void {
        this.app.enableCors({
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
        this.app.setGlobalPrefix(this.configService.get<string>('globalApiPrefix'));
        this.app.useGlobalFilters(new HttpExceptionFilter());
        this.app.useLogger(this.app.get(WINSTON_MODULE_NEST_PROVIDER));
        this.app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        this.app.use(cookieParser());
        this.app.use(helmet());
    }

    async setupSwagger() {
        const config = new DocumentBuilder()
            .setTitle('ISCX Template APIs')
            .addBearerAuth({ name: 'Authorization', type: 'http' })
            .addSecurityRequirements('bearer')
            .build();
        const document = SwaggerModule.createDocument(this.app, config);

        SwaggerModule.setup(this.configService.get<string>('swaggerUrl'), this.app, document, {
            swaggerOptions: {
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        });
    }
}

export const appSetup = async (app: INestApplication): Promise<INestApplication> => {
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

    app.setGlobalPrefix(configService.get<string>('globalApiPrefix'));
    app.useGlobalFilters(new HttpExceptionFilter());
    const config = new DocumentBuilder()
        .setTitle('ISCX Template APIs')
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

    return app;
};
