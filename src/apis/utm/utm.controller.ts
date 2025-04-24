import { Public } from '@ignidus/iscx-backend-utils';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { EnqueueRequestDto, TaskFilters, UtmResponseDto } from './dto';
import { UtmService } from './utm.service';
import { SessionIDGuard } from '../../shared/guards';

@ApiTags('UTM')
@Controller('utm')
@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
@ApiInternalServerErrorResponse({ description: 'Internal server error.' })
export class UtmController {
    constructor(private readonly utmService: UtmService) {}

    @Post('enqueue')
    @Public() // override the global guard then use the sessionID guard
    @UseGuards(SessionIDGuard)
    @ApiOperation({ summary: 'Enqueue task' })
    @ApiCreatedResponse({ description: 'The task has been successfully enqueued.' })
    enqueue(@Body() body: EnqueueRequestDto): Promise<void> {
        return this.utmService.enqueue(body);
    }

    @Get('tasks')
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiOkResponse({ description: 'The tasks have been successfully fetched.', type: UtmResponseDto, isArray: true })
    findAll(@Query() filters?: TaskFilters): Promise<UtmResponseDto[]> {
        return this.utmService.findAll(filters);
    }
}
