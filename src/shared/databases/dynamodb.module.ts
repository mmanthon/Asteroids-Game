import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
    DocumentClassificationEntity,
    DynamoApplicationEntity,
    DynamoAutoDeclinationHistoryEntity,
    DynamoEmailHistoryEntity,
    DynamoNoteEntity,
    DynamoProductEntity,
    DynamoProductVersionEntity,
    DynamoTaskEntity,
    DynamoTaskWebsocketConnectionEntity,
    DynamoUserEntity,
    DynamodbClaimEntity,
    RiskSummarizationEntity,
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
                    entityClass: DynamoAutoDeclinationHistoryEntity,
                    metadata: { tableNameKey: 'dynamodb.autoDeclinationHistoryTableName' },
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
                {
                    entityClass: DynamoTaskWebsocketConnectionEntity,
                    metadata: { tableNameKey: 'dynamodb.wsConnectionsTableName' },
                },
                {
                    entityClass: DynamoTaskEntity,
                    metadata: { tableNameKey: 'dynamodb.tasksTableName' },
                },
                {
                    entityClass: DynamoEmailHistoryEntity,
                    metadata: { tableNameKey: 'dynamodb.emailHistoryTableName' },
                },
                {
                    entityClass: DynamoProductVersionEntity,
                    metadata: { tableNameKey: 'dynamodb.productVersionsTableName' },
                },
                {
                    entityClass: DynamoProductEntity,
                    metadata: { tableNameKey: 'dynamodb.productsTableName' },
                },
                {
                    entityClass: RiskSummarizationEntity,
                    metadata: { tableNameKey: 'dynamodb.riskSummarizationTableName' },
                },
                {
                    entityClass: DocumentClassificationEntity,
                    metadata: { tableNameKey: 'dynamodb.documentClassificationsTableName' },
                },
            ],
            dynamoEntityFactory,
        ),
    ],
    exports: [
        DynamoUserEntity,
        DynamoApplicationEntity,
        DynamoAutoDeclinationHistoryEntity,
        DynamodbClaimEntity,
        DynamoNoteEntity,
        DynamoTaskWebsocketConnectionEntity,
        DynamoTaskEntity,
        DynamoDB,
        DynamoEmailHistoryEntity,
        DynamoProductEntity,
        DynamoProductVersionEntity,
        RiskSummarizationEntity,
        DocumentClassificationEntity,
    ],
})
export class DynamoDBModule {}
