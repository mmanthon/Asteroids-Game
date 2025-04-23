import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { DriverRiskQuery } from '../driverRisk.query';
import { DriverRiskRequestDto } from '../dto';

@Injectable()
export class ValidatePopulateDriverRiskRequest implements PipeTransform {
    constructor(private readonly driverRiskQuery: DriverRiskQuery) {}

    /**
     * @description validate license numbers
     * @param { DriverRiskRequestDto} driverRequest
     * @returns {Promise<DriverRiskRequestDto>}
     */
    async transform(driverRequest: DriverRiskRequestDto): Promise<DriverRiskRequestDto> {
        await Promise.all(
            driverRequest.licenseNumbers.map(async (licenseNumber) => {
                const exists = await this.driverRiskQuery.driversLicenseExists(licenseNumber);

                if (!exists) {
                    throw new BadRequestException(
                        `Validation failed: driver with license number ${licenseNumber} does not exist`,
                    );
                }
            }),
        );

        return driverRequest;
    }
}
