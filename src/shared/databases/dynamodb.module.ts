import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
    DynamoApplicationEntity,
    DynamoNoteEntity,
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
                {
                    entityClass: DynamoNoteEntity,
                    metadata: { tableNameKey: 'dynamodb.notesTableName' },
                },
            ],
            dynamoEntityFactory,
        ),
    ],
    exports: [DynamoUserEntity, DynamoApplicationEntity, DynamodbClaimEntity, DynamoNoteEntity, DynamoDB],
})
export class DynamoDBModule {}
