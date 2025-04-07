import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HazardHubUtil } from '../hazardhub.util';
import { mockAddress } from '../mocks/constants';

describe('HazardhubUtil', () => {
    let util: HazardHubUtil;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HazardHubUtil,
                {
                    provide: 'Amp',
                    useValue: {},
                },
            ],
        }).compile();

        util = module.get<HazardHubUtil>(HazardHubUtil);
    });

    it('should be defined', () => {
        expect(util).toBeDefined();
    });

    it('should return true if all address fields are present', () => {
        const result = util.validateAddress(mockAddress);

        expect(result).toBe(true);
    });

    it('should throw if required fields are missing', () => {
        const invalidAddress = { ...mockAddress, city: ' ' };

        expect(() => util.validateAddress(invalidAddress)).toThrow(BadRequestException);
    });
});
