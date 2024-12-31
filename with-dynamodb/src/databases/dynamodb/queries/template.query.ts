import { DynamoDB  } from '@aws-sdk/client-dynamodb';
import { DynamoProductEntity, ProductDynamoModel } from '@ignidus/iscx-backend-utils';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * This is an example of a class that can be used to query the DynamoDB tables.
 * Remove or edit this file as needed.
 */
export class DynamodbTemplateQueries {
    readonly productEntity: DynamoProductEntity;

    constructor(dynamodb: DynamoDB, config: ConfigService) {
        this.productEntity = new DynamoProductEntity(dynamodb, config.get<string>('dynamodb.productTableName'));
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
