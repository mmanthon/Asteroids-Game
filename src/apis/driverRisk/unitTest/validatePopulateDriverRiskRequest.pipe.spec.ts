import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DriverRiskQuery } from '../driverRisk.query';
import { ValidatePopulateDriverRiskRequest } from '../pipes/validatePopulateDriverRiskRequest.pipe';

describe('ValidatePopulateDriverRiskRequest Pipe', () => {
    let pipe: ValidatePopulateDriverRiskRequest;
    const driversLicenseExists = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ValidatePopulateDriverRiskRequest,
                {
                    provide: DriverRiskQuery,
                    useValue: { driversLicenseExists },
                },
            ],
        }).compile();

        pipe = module.get(ValidatePopulateDriverRiskRequest);
        jest.clearAllMocks();
    });

    it('should return the same request when all license numbers exist', async () => {
        const req = { licenseNumbers: ['A1', 'B2', 'C3'] };

        driversLicenseExists.mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(true);

        const result = await pipe.transform(req);

        expect(result).toBe(req);
        expect(driversLicenseExists).toHaveBeenCalledTimes(3);
        expect(driversLicenseExists).toHaveBeenNthCalledWith(1, 'A1');
        expect(driversLicenseExists).toHaveBeenNthCalledWith(2, 'B2');
        expect(driversLicenseExists).toHaveBeenNthCalledWith(3, 'C3');
    });

    it('should throw BadRequestException when any license number does not exist', async () => {
        const req = { licenseNumbers: ['OK-1', 'MISSING-9', 'OK-2'] };

        driversLicenseExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

        await expect(pipe.transform(req)).rejects.toThrow(BadRequestException);
        await expect(pipe.transform(req)).rejects.toThrow(
            'Validation failed: driver with license number OK-1 does not exist',
        );
    });

    it('should not call repository when licenseNumbers is empty and should return request', async () => {
        const req = { licenseNumbers: [] };

        const result = await pipe.transform(req);

        expect(result).toBe(req);
        expect(driversLicenseExists).not.toHaveBeenCalled();
    });

    it('should propagate unexpected errors from query as BadRequestException is not thrown here', async () => {
        const req = { licenseNumbers: ['ERR-1'] };

        driversLicenseExists.mockRejectedValueOnce(new Error('db down'));

        await expect(pipe.transform(req)).rejects.toThrow('db down');
        expect(driversLicenseExists).toHaveBeenCalledWith('ERR-1');
    });
});
