import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ApplicationSetup } from './appSetup';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: false });

    await new ApplicationSetup(app).server();
}
bootstrap();
