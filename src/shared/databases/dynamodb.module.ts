import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoUserEntity, createEntityProviders, dynamoEntityFactory } from '@ignidus/iscx-backend-utils';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
        ...createEntityProviders(
            [DynamoDB, ConfigService],
            [
                {
                    entityClass: DynamoUserEntity,
                    metadata: { tableNameKey: 'dynamodb.accessControlUsersTableName' },
                },
            ],
            dynamoEntityFactory,
        ),
    ],
    exports: [DynamoUserEntity, DynamoDB],
})
export class DynamoDBModule {}
