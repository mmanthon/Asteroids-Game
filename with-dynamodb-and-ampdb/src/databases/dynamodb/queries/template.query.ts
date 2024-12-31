import { DynamoDB, TransactWriteItem } from '@aws-sdk/client-dynamodb';
import {
    DynamoApplicationEntity,
    DynamoProductEntity,
    DynamoProductVersionEntity,
    ProductDynamoModel,
    TransactionEntity,
} from '@ignidus/iscx-backend-utils';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * This is an example of a class that can be used to query the DynamoDB tables.
 * Remove or edit this file as needed.
 */
export class DynamodbTemplateQueries {
    readonly applicationEntity: DynamoApplicationEntity;
    readonly transactionEntity: TransactionEntity;
    readonly productVersionEntity: DynamoProductVersionEntity;
    readonly productEntity: DynamoProductEntity;

    constructor(dynamodb: DynamoDB, config: ConfigService) {
        this.applicationEntity = new DynamoApplicationEntity(
            dynamodb,
            config.get<string>('dynamodb.applicationsTableName'),
        );
        this.productVersionEntity = new DynamoProductVersionEntity(
            dynamodb,
            config.get<string>('dynamodb.productVersionTableName'),
        );
        this.productEntity = new DynamoProductEntity(dynamodb, config.get<string>('dynamodb.productTableName'));
        this.transactionEntity = new TransactionEntity(dynamodb);
    }

    /**
     * Uses a transaction to write to the DynamoDB table.
     * @param {TransactWriteItem[]} transactionItems
     * @returns {Promise<void>}
     * */
    async transactionWrite(transactionItems: TransactWriteItem[]): Promise<void> {
        await this.transactionEntity.write(transactionItems);
    }

    /**
     * Get product stored DynamoDB table.
     * @param {string} productID
     * @param {number} version
     * @returns {Promise<ProductDynamoModel>}
     */
    async findProduct(productID: string, version: number): Promise<ProductDynamoModel> {
        return await this.productEntity.findOneByVersion(productID, version);
    }
}
