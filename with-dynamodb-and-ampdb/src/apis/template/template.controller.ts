import { Public } from '@ignidus/iscx-backend-utils';
import { Controller, Get, Param } from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TemplateDto } from './dto';
import { TemplateService } from './template.service';

/**
 * This is an example of a controller that can be used to create an API endpoint.
 * Remove or edit this file as needed.
 * */
@ApiTags('Template')
@Controller('template')
export class TemplateController {
    constructor(private readonly templateService: TemplateService) {}

    /**
     * Example method protected by JWT
     **/
    @Get('/')
    @ApiOperation({ summary: 'Get Item' })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiOkResponse({ description: 'Item found', type: TemplateDto })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    findOne(): string {
        return this.templateService.findOne();
    }

    /**
     * Example public method
     **/
    @Get('/:id')
    @Public()
    @ApiOperation({ summary: 'Get Item' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiOkResponse({ description: 'Item found', type: TemplateDto })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    findOneById(@Param('id') id: string): string {
        return `This is your id ${id}`;
    }
}
