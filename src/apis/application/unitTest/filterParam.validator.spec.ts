/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NotFoundException } from '@nestjs/common';

import { ApplicationQuery } from '../application.query';
import { FilterParamDto } from '../dto';
import { agencyID, parentAgencyID, validInput } from '../mocks';
import { FilterParamValidator } from '../validators/filterParam.validator';

describe('FilterParamValidator', () => {
    let validator: FilterParamValidator<FilterParamDto>;
    let mockQuery: jest.Mocked<Pick<ApplicationQuery, 'productsExist' | 'agencyExists' | 'agentExists'>>;

    beforeEach(() => {
        mockQuery = {
            productsExist: jest.fn(),
            agencyExists: jest.fn(),
            agentExists: jest.fn(),
        };

        validator = new FilterParamValidator(mockQuery as unknown as ApplicationQuery);
    });

    it('should validate successfully when all entities exist', async () => {
        mockQuery.productsExist.mockResolvedValue({ exists: true, notFoundProducts: [] });
        mockQuery.agencyExists!.mockResolvedValue(true);
        mockQuery.agentExists!.mockResolvedValue(true);

        const result = await validator.transform(validInput);

        expect(result).toEqual(validInput);
    });

    it('should throw NotFoundException if products are invalid', async () => {
        mockQuery.productsExist.mockResolvedValue({ exists: false, notFoundProducts: ['p1'] });

        await expect(validator.transform({ productIDs: ['p1'] })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if agency is invalid', async () => {
        mockQuery.productsExist.mockResolvedValue({ exists: true, notFoundProducts: [] });
        mockQuery.agencyExists!.mockResolvedValue(false);

        await expect(validator.transform({ agencyID })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if parentAgencyID is invalid', async () => {
        mockQuery.agencyExists!.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

        await expect(validator.transform({ agencyID, parentAgencyID })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if an agent is invalid', async () => {
        mockQuery.agentExists!.mockResolvedValueOnce(false);

        await expect(validator.transform({ agentIDs: ['bad'] })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if an assigned underwriter is invalid', async () => {
        mockQuery.agentExists!.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

        await expect(validator.transform({ agentIDs: ['valid'], assignedUWIDs: ['bad'] })).rejects.toThrow(
            NotFoundException,
        );
    });
});
