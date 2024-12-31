/* eslint-disable camelcase */
import { ItemEntity } from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

/**
 * This is an example of a class that can be used to query the AMP database.
 * Remove or edit this file as needed.
 * */
@Injectable()
export class AmpTemplateQueries {
    readonly itemEntity: ItemEntity;

    constructor(@InjectKnex() private readonly amp: Knex) {
        this.itemEntity = new ItemEntity(this.amp);
    }

    /**
     * Updates the submission status
     * Sets the status id of each item in submission group
     * @param {number} submissionID
     * @param {number} statusID
     * @returns {Promise<void>}
     */
    async updateSubmissionStatus(submissionID: number, statusID: number): Promise<void> {
        await this.itemEntity.updateItemStatusBySubmissionID(submissionID, statusID);
    }
}
