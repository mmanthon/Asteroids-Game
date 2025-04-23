import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DriverRiskRequestDto {
    @ApiProperty({
        description: 'Array of license numbers',
        example: ['G1045488', '2581477'],
        isArray: true,
        type: String,
    })
    @IsArray()
    @IsString({ each: true })
    licenseNumbers: string[];
}
