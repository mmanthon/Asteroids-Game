import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DriverRiskService } from './driverRisk.service';
import { DriverRiskRequestDto, DriverRiskResponseDto } from './dto';
import { ValidatePopulateDriverRiskRequest } from './pipes/validatePopulateDriverRiskRequest.pipe';
import { AppIDValidator } from '../../shared/validators';

@ApiTags('Driver Risk')
@Controller('driver-risk')
export class DriverRiskController {
    constructor(private readonly service: DriverRiskService) {}

    @Get(':appID')
    @ApiTags('Driver Risk')
    @ApiOperation({ summary: 'Get Driver Risk for an application' })
    @ApiOkResponse({ description: 'Success', type: DriverRiskResponseDto, isArray: true })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Application not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    getDriverRisk(@Param('appID', AppIDValidator) appID: string): Promise<DriverRiskResponseDto[]> {
        return this.service.getDriverRisk(appID);
    }

    @Post(':appID')
    @ApiTags('Driver Risk')
    @ApiOperation({ summary: 'Post Driver Risk for an application' })
    @ApiCreatedResponse({ description: 'Success', type: DriverRiskResponseDto, isArray: true })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Application not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @UsePipes(new ValidationPipe({ transform: true }))
    postDriverRisk(
        @Param('appID', AppIDValidator) appID: string,
        @Body(ValidatePopulateDriverRiskRequest) driverRequest: DriverRiskRequestDto,
    ): Promise<DriverRiskResponseDto[]> {
        return this.service.populateDriverRisk(appID, driverRequest);
    }
}
