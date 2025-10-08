import { BadRequestException, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { ApplicationQuery } from '../application.query';

type Target = {
    productIDs?: string[];
    agencyID?: string;
    parentAgencyID?: string;
    agentIDs?: string[];
    assignedUWIDs?: string[];
    createdDateStart?: string;
    createdDateEnd?: string;
};

@Injectable()
export class FilterParamValidator<T extends Target> implements PipeTransform<Target> {
    constructor(private readonly applicationQuery: ApplicationQuery) {}

    /**
     * @description Validates the query parameters
     * @template {T extends Target}
     * @param {T} target
     * @throws {BadRequestException | NotFoundException}
     * @returns {Promise<T>}
     */
    async transform(target: T): Promise<T> {
        const { productIDs, agencyID, parentAgencyID, agentIDs, assignedUWIDs, createdDateStart, createdDateEnd } =
            target;

        this.validateCreatedDateRange(createdDateStart, createdDateEnd);
        if (productIDs) await this.validateProducts(productIDs);
        if (agencyID) await this.valdiateAgency(agencyID);
        if (parentAgencyID) await this.valdiateAgency(parentAgencyID);
        if (agentIDs) await this.validateAgent(agentIDs);
        if (assignedUWIDs) await this.validateAgent(assignedUWIDs);

        return target;
    }

    /**
     * @description Validates the created date range
     * @param {string} start
     * @param {string} end
     */
    private validateCreatedDateRange(start?: string, end?: string): void {
        if (start && end && end < start) {
            throw new BadRequestException('createdDateEnd must be >= createdDateStart');
        }
    }

    /**
     * @description Ensures that the products exists
     * @param {string[]} products
     * @throws {NotFoundException}
     * @returns {Promise<void>}
     */
    private async validateProducts(products: string[]): Promise<void> {
        const { exists, notFoundProducts } = await this.applicationQuery.productsExist(products);

        if (!exists) throw new NotFoundException(`Products not found: ${notFoundProducts.join(', ')}`);
    }

    /**
     * @description Ensures that the agency exists
     * @param {string} agencyID
     * @throws {NotFoundException}
     * @returns {Promise<void>}
     */
    private async valdiateAgency(agencyID: string): Promise<void> {
        const exists = await this.applicationQuery.agencyExists(agencyID);

        if (!exists) throw new NotFoundException(`Agency not found: ${agencyID}`);
    }

    /**
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
