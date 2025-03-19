import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
    DynamoApplicationEntity,
    DynamoUserEntity,
    DynamodbClaimEntity,
    createEntityProviders,
    dynamoEntityFactory,
} from '@ignidus/iscx-backend-utils';
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
                {
                    entityClass: DynamoApplicationEntity,
                    metadata: { tableNameKey: 'dynamodb.applicationsTableName' },
                },
                {
                    entityClass: DynamodbClaimEntity,
                    metadata: { tableNameKey: 'dynamodb.claimsTableName' },
                },
            ],
            dynamoEntityFactory,
        ),
    ],
    exports: [DynamoUserEntity, DynamoApplicationEntity, DynamodbClaimEntity, DynamoDB],
})
export class DynamoDBModule {}
