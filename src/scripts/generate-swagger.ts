import { S3 } from '@aws-sdk/client-s3';
import { buildSwaggerDocument } from '@ignidus/iscx-backend-utils';
import { NestFactory } from '@nestjs/core';

import { swaggerConfig } from '../../config/swagger';
import { AppModule } from '../app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        preview: true,
        abortOnError: false,
    });

    const document = buildSwaggerDocument(app, swaggerConfig);
    const swaggerJson = JSON.stringify(document, null, 2);
    const s3 = new S3({ region: process.env.AWS_REGION ?? 'us-west-2' });

    await s3.putObject({
        Bucket: 'iscx-dev-swagger-docs',
        Key: swaggerConfig.swaggerFilename,
        Body: swaggerJson,
        ContentType: 'application/json',
    });
    process.exit(0);
}
bootstrap().catch((err) => {
    console.error('Failed to upload Swagger:', err);
    process.exit(1);
});
