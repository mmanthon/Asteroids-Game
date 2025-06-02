import { AmpRolesEnum, AuthenticatedRequest, Roles } from '@ignidus/iscx-backend-utils';
import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApplicationService } from './application.service';
import { ApplicationDto, FilterParamDto, FindAllResponseDto, UpdateApplicationRequestDto } from './dto';
import { FilterParamValidator, PatchApplicationValidator } from './validators';
import { RoleGuard } from '../../shared/guards';
import { AppIDValidator } from '../../shared/validators';

@ApiTags('Application')
@Controller('applications')
@Roles(AmpRolesEnum.UNDERWRITER)
@UseGuards(RoleGuard)
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}

    @Get('')
    @ApiOperation({ summary: 'Get all applications' })
    @ApiOkResponse({ description: 'All applications', type: FindAllResponseDto })
    findAll(@Query(FilterParamValidator) filters: FilterParamDto): Promise<FindAllResponseDto> {
        return this.applicationService.findAll(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one application' })
    @ApiOkResponse({ description: 'Application found', type: ApplicationDto })
    @ApiNotFoundResponse({ description: 'Not found' })
    findOne(@Param('id', AppIDValidator) id: string, @Req() { user }: AuthenticatedRequest): Promise<ApplicationDto> {
        return this.applicationService.findOne(id, user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update List View Application' })
    @ApiBody({ type: UpdateApplicationRequestDto })
    @ApiOkResponse({ description: 'Application updated', type: ApplicationDto })
    @ApiNotFoundResponse({ description: 'Not found' })
    updateOne(
        @Param('id', AppIDValidator) id: string,
        @Body(PatchApplicationValidator) updateParam: UpdateApplicationRequestDto,
        @Req() { user }: AuthenticatedRequest,
    ): Promise<ApplicationDto> {
        return this.applicationService.updateOne(id, updateParam, user);
    }
}
