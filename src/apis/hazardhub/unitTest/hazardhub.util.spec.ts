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

    it('should throw if addres is undefined', () => {
        expect(() => util.validateAddress(undefined as any)).toThrow(BadRequestException);
    });

    it('should throw if addres is an empty object', () => {
        expect(() => util.validateAddress({} as any)).toThrow(BadRequestException);
    });

    it('should throw with multiple missing fields', () => {
        const invalidAddress = {
            ...mockAddress,
            city: '',
        };

        try {
            util.validateAddress(invalidAddress);
            fail('Expected BadRequestException to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toContain('city');
            expect(error.message).toContain('Missing or empty required address fields');
        }
    });

    it('should throw if all required fields are empty but address is defined', () => {
        const invalidAddress = {
            streetAddress: '',
            city: '',
            state: '',
            zip: '',
        };

        try {
            util.validateAddress(invalidAddress);
            fail('Expected BadRequestException to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toContain('Missing or empty required address fields');
            expect(error.message).toContain('streetAddress');
            expect(error.message).toContain('city');
            expect(error.message).toContain('state');
            expect(error.message).toContain('zip');
        }
    });

    it('should throw if address is undefined', () => {
        try {
            util.validateAddress(undefined as any);
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toContain('Missing or empty required address fields');
        }
    });
});
