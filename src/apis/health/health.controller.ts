import { Public } from '@ignidus/iscx-backend-utils';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Public()
    @Get('')
    @ApiOperation({ summary: 'Check server status' })
    @ApiOkResponse({ description: 'Server running' })
    health() {
        return '';
    }
}
