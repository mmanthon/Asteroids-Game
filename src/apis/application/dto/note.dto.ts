import { NoteResponseDto } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

import { NoteTypeEnum } from '../enums';

export class NoteDto extends NoteResponseDto {
    @ApiProperty({ description: 'Note Type', enum: NoteTypeEnum })
    type: NoteTypeEnum;
}
