import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { ApplicationQuery } from '../application.query';

type Target = { underwriterUserIDs?: string[]; agentID?: string };

@Injectable()
export class PatchApplicationValidator<T extends Target> implements PipeTransform<Target> {
    constructor(private readonly applicationQuery: ApplicationQuery) {}

    /**
     * Validates the request body for the list view application patch endoint
     * @template {T extends Target}
     * @param {T} target
     * @throws {BadRequestException | NotFoundException}
     * @returns {Promise<T>}
     */
    async transform(target: T): Promise<T> {
        const { underwriterUserIDs, agentID } = target;

        if (underwriterUserIDs) await this.validateAgent(underwriterUserIDs);
        if (agentID) await this.validateAgent([agentID]);

        return target;
    }

    /**
     * @private
     * @description Ensures that the users exists
     * @param {string[]} userIDs
     * @throws {NotFoundException}
     * @returns {Promise<void>}
     */
    private async validateAgent(userIDs: string[]): Promise<void> {
        const userIDpromises = userIDs.map(async (userID) => {
            const exists = await this.applicationQuery.agentExists(userID);

            if (!exists) throw new NotFoundException(`Agent not found: ${userID}`);
        });

        await Promise.all(userIDpromises);
    }
}
