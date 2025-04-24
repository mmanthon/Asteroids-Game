/* eslint-disable sort-exports/sort-exports */
import { AmpEmailActionTypeLabelEnum, TaskStatusEnum } from '@ignidus/iscx-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class TaskAssignedUserDto {
    @ApiProperty({ description: 'The id of the user', example: '1', type: String })
    id: string;

    @ApiProperty({ description: 'The first name of the user', example: 'John', type: String })
    fname: string;

    @ApiProperty({ description: 'The last name of the user', example: 'Wick', type: String })
    lname: string;
}

export class TaskAgencyDto {
    @ApiProperty({ description: 'The id of the agency', example: '1', type: String })
    id: string;

    @ApiProperty({ description: 'The label of the agency', example: 'Agency Name', type: String })
    label: string;
}

export class TaskProductDto {
    @ApiProperty({ description: 'The id of the product', example: '1', type: String })
    id: string;

    @ApiProperty({ description: 'The label of the product', example: 'Product Name', type: String })
    label: string;
}

export class TaskProgramTypeDto {
    @ApiProperty({ description: 'The id of the program type', example: '1', type: String })
    id: string;

    @ApiProperty({ description: 'The label of the program type', example: 'Program Type Name', type: String })
    label: string;
}

export class UtmResponseDto {
    @ApiProperty({ description: 'The id of the task', example: '1', type: String })
    id: string;

    @ApiProperty({ description: 'The name of the task', example: TaskStatusEnum.NOT_STARTED, enum: TaskStatusEnum })
    status: TaskStatusEnum;

    @ApiProperty({ description: 'The application id tied to the task', example: '654645645', type: String })
    appID: string;

    @ApiProperty({ description: 'Flag to determine if the task is new', example: true, type: Boolean })
    isNew: boolean;

    @ApiProperty({ description: 'The name of the company', example: 'Company Name', type: String })
    companyName: string;

    @ApiProperty({
        description: 'User assigned to the task',
        example: { id: '3245324', fname: 'John', lname: 'Wick' },
        type: TaskAssignedUserDto,
    })
    assignedUser: TaskAssignedUserDto;

    @ApiProperty({
        description: 'Product tied to the task',
        example: [{ id: '3245324', label: 'Product Name' }],
        type: TaskProductDto,
        isArray: true,
    })
    products: TaskProductDto[];

    @ApiProperty({
        description: 'The action type of the task',
        example: AmpEmailActionTypeLabelEnum.pendingBind,
        enum: AmpEmailActionTypeLabelEnum,
    })
    actionType: AmpEmailActionTypeLabelEnum;

    @ApiProperty({
        description: 'The agency tied to the task',
        example: { id: '3245324', label: 'Agency Name' },
        type: TaskAgencyDto,
    })
    agency: TaskAgencyDto;

    @ApiProperty({
        description: 'The program types tied to the task',
        example: [{ id: '3245324', label: 'Program Type Name' }],
        type: TaskProgramTypeDto,
        isArray: true,
    })
    programTypes: TaskProgramTypeDto[];

    @ApiProperty({ description: 'The tags tied to the task', example: ['tag1', 'tag2'], type: String, isArray: true })
    tags: string[];

    @ApiProperty({ description: 'Flag to determine if the task is archived', example: false, type: Boolean })
    isArchived: boolean;

    @ApiProperty({ description: 'The position of the task', example: 1, type: Number })
    position: number;

    @ApiProperty({ description: 'The user who updated the task', example: '1', type: String })
    updatedBy: string;

    @ApiProperty({
        description: 'The groups tied to the task',
        example: ['group1', 'group2'],
        type: String,
        isArray: true,
    })
    groups: string[];

    @ApiProperty({
        description: 'The date the task was updated',
        example: '2021-01-01T00:00:00.000Z',
        type: String,
    })
    updatedDate: string;

    @ApiProperty({
        description: 'The date the task was created',
        example: '2021-01-01T00:00:00.000Z',
        type: String,
    })
    createdDate: string;
}
