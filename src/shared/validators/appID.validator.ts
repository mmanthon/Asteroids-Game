import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AppIDValidator implements PipeTransform<string> {
    constructor(private readonly itemEntity: ItemEntity) {}
    /**
     * @description Validate that the appID exists
     * @param {string} appID - Application id to validate
     * @throws {BadRequestException}
     * @returns {string} - The validated appID
     */
    async transform(appID: string): Promise<string> {
        const exist = await this.itemEntity.findOne(appID);

        if (!exist) {
            throw new BadRequestException(`No application found with id: ${appID}`);
        }

        return appID;
    }
}
