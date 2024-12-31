import { Module } from '@nestjs/common';

import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

/**
 * This is an example of a module class
 * Remove or edit this file as needed.
 * */
@Module({
    controllers: [TemplateController],
    providers: [TemplateService],
})
export class TemplateModule {}
