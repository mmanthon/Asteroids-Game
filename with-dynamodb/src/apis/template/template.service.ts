import { Injectable } from '@nestjs/common';

import { DynamodbTemplateQueries } from '../../databases/dynamodb/queries';

/**
 * This is an example of a service class
 * Remove or edit this file as needed.
 **/
@Injectable()
export class TemplateService {
    constructor(private readonly dynamodbQueries: DynamodbTemplateQueries) {}

    /**
     * Example method
     **/
    findOne(): string {
        return 'Found one!';
    }
}
