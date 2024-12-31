import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DynamodbTemplateQueries } from './queries';

@Global()
@Module({
    providers: [
        {
            provide: DynamoDB,
            useFactory: (configService: ConfigService) => {
                return new DynamoDB({ region: configService.get<string>('awsRegion') });
            },
            inject: [ConfigService],
        },
        DynamodbTemplateQueries,
    ],
    exports: [DynamodbTemplateQueries, DynamoDB],
})
export class DynamoDBModule {}
