/* eslint-disable sort-exports/sort-exports */
import { ApplicationStatusDisplayValueEnum, ApplicationTypeEnum, UsStatesEnum } from '@ignidus/iscx-backend-utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MinLength,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

import { SortByEnum, SortOrderEnum } from '../enums';

@ValidatorConstraint({ name: 'noEmptyStrings', async: false })
class NoEmptyStringsConstraint implements ValidatorConstraintInterface {
    validate(value: any) {
        if (Array.isArray(value)) {
            return value.every((item) => item !== '');
        }

        return false;
    }

    defaultMessage() {
        return 'Array should not contain empty strings';
    }
}
@ValidatorConstraint({ name: 'isValidStatus', async: false })
export class IsValidStatus implements ValidatorConstraintInterface {
    validate(statuses: any) {
        return (
            Array.isArray(statuses) &&
            statuses.every((status: ApplicationStatusDisplayValueEnum) =>
                Object.values(ApplicationStatusDisplayValueEnum).includes(status),
            )
        );
    }

    defaultMessage() {
        return 'Invalid status value';
    }
}

@ValidatorConstraint({ name: 'isValidState', async: false })
export class IsValidState implements ValidatorConstraintInterface {
    validate(states: any) {
        return (
            Array.isArray(states) &&
            states.every((state: UsStatesEnum) =>
                Object.values(UsStatesEnum)
                    .map((enumState) => enumState.toLowerCase())
                    .includes(state.toLowerCase()),
            )
        );
    }

    defaultMessage() {
        return 'Invalid state value';
    }
}

export class FilterParamDto {
    @ApiPropertyOptional({ description: 'Number of items per page (used for pagination)', default: 25, example: 25 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    pageLimit?: number;

    @ApiPropertyOptional({ description: 'Next page number (used for pagination)', default: 1, example: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    nextPage?: number;

    @ApiPropertyOptional({ description: 'Sort by', enum: SortByEnum, default: SortByEnum.APP_ID })
    @IsOptional()
    @IsEnum(SortByEnum)
    sortBy?: SortByEnum;

    @ApiPropertyOptional({ description: 'Sort order', enum: SortOrderEnum, example: SortOrderEnum.DESC })
    @IsOptional()
    @IsEnum(SortOrderEnum)
    sortOrder?: SortOrderEnum;

    @ApiPropertyOptional({ description: 'Search term', type: String })
    @IsOptional()
    @IsString()
    @MinLength(3)
    searchTerm?: string;

    @ApiPropertyOptional({ description: 'Product IDs (comma separated)', type: String })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((productID) => productID.trim());
        }

        return value;
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'ProductIDs array should not be empty' })
    @ArrayUnique({ message: 'ProductIDs array should contain unique values' })
    @Validate(NoEmptyStringsConstraint)
    productIDs?: string[];

    @ApiPropertyOptional({ description: 'Agency ID' })
    @IsOptional()
    @IsString()
    agencyID?: string;

    @ApiPropertyOptional({ description: 'Parent Agency ID' })
    @IsOptional()
    @IsString()
    parentAgencyID?: string;

    @ApiPropertyOptional({ description: 'Agent IDs (comma separated)', type: String })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((productID) => productID.trim());
        }

        return value;
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'AgentIDs array should not be empty' })
    @ArrayUnique({ message: 'AgentIDs array should contain unique values' })
    @Validate(NoEmptyStringsConstraint)
    agentIDs?: string[];

    @ApiPropertyOptional({ description: 'Assigned UW IDs (comma separated)', type: String })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((id) => id.trim());
        }

        return value;
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'assignedUWIDs array should not be empty' })
    @ArrayUnique({ message: 'assignedUWIDs array should contain unique values' })
    @Validate(NoEmptyStringsConstraint)
    assignedUWIDs?: string[];

    @ApiPropertyOptional({
        description: 'Filter for unassigned applications only',
        example: true,
        type: Boolean,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === 'false') {
            return value === 'true';
        }

        return value;
    })
    @IsBoolean()
    unassignedOnly?: boolean;

    @ApiPropertyOptional({
        description: 'Application status (comma separated)',
        type: String,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((status) => status.trim());
        }

        return value;
    })
    @Validate(IsValidStatus)
    @IsArray()
    @ArrayNotEmpty({ message: 'Status array should not be empty' })
    @ArrayUnique({ message: 'Status array should contain unique values' })
    statuses?: ApplicationStatusDisplayValueEnum[];

    @ApiPropertyOptional({
        description: 'State (comma separated)',
        type: String,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((state) => state.trim().toLowerCase());
        }

        return value;
    })
    @Validate(IsValidState)
    @IsArray()
    @ArrayNotEmpty({ message: 'State array should not be empty' })
    @ArrayUnique({ message: 'State array should contain unique values' })
    states?: UsStatesEnum[];

    @ApiPropertyOptional({ description: 'Application type', enum: ApplicationTypeEnum })
    @IsOptional()
    @IsEnum(ApplicationTypeEnum)
    type?: ApplicationTypeEnum;

    @ApiPropertyOptional({ description: 'Start date (effective date) (YYYY-MM-DD)', type: String, deprecated: true })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in the format YYYY-MM-DD' })
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date (effective date) (YYYY-MM-DD)', type: String, deprecated: true })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be in the format YYYY-MM-DD' })
    endDate?: string;

    @ApiPropertyOptional({ description: 'Start of effective date range (YYYY-MM-DD)', type: String })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'effectiveDateStart must be in the format YYYY-MM-DD' })
    effectiveDateStart?: string;

    @ApiPropertyOptional({ description: 'End of effective date range (YYYY-MM-DD)', type: String })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'effectiveDateEnd must be in the format YYYY-MM-DD' })
    effectiveDateEnd?: string;

    @ApiPropertyOptional({ description: 'Start of updatedAt range (YYYY-MM-DD)', type: String })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'updatedAtStart must be in the format YYYY-MM-DD' })
    updatedAtStart?: string;

    @ApiPropertyOptional({ description: 'End of updatedAt range (YYYY-MM-DD)', type: String })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'updatedAtEnd must be in the format YYYY-MM-DD' })
    updatedAtEnd?: string;
}
