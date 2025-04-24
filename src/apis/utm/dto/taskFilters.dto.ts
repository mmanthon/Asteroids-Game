import { UtmGroupEnum } from '@ignidus/iscx-backend-utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEnum, IsOptional } from 'class-validator';

export class TaskFilters {
    @ApiPropertyOptional({
        description: 'Task Groups to filter on',
        type: String,
        example: `${UtmGroupEnum.POST_BIND},${UtmGroupEnum.PRE_BIND}`,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((group) => group.trim());
        }

        return value;
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'Groups array should not be empty' })
    @ArrayUnique({ message: 'Groups array should contain unique values' })
    @IsEnum(UtmGroupEnum, { each: true, message: 'Each value in groups must be a valid UtmGroupEnum' })
    groups?: UtmGroupEnum[];
}
