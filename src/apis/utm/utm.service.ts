import { DynamoTaskEntity, EmailTrackingEntity } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';
import { nanoid } from 'nanoid';

import { EnqueueRequestDto, TaskFilters, UtmResponseDto } from './dto';
import { UtmUtil } from './utm.util';

@Injectable()
export class UtmService {
    constructor(
        private readonly utmUtil: UtmUtil,
        private readonly taskEntity: DynamoTaskEntity,
        private readonly sqsService: SqsService,
        private readonly configService: ConfigService,
        private readonly emailTrackingEntity: EmailTrackingEntity,
    ) {}

    /**
     * @description Enqueue task
     * @param {EnqueueRequestDto} body
     * @returns {Promise<void>}
     */
    async enqueue(body: EnqueueRequestDto): Promise<void> {
        const emailRecord = await this.emailTrackingEntity.getEmailRecordByID(Number(body.emailID));

        if (!emailRecord) {
            throw new BadRequestException('Email record not found');
        }

        await this.sqsService.send(this.configService.get<string>('utmQueue.name'), {
            id: nanoid(11),
            body: body,
        });
    }

    /**
     * @description Get all tasks
     * @returns {Promise<UtmResponseDto[]>}
     */
    async findAll({ groups }: TaskFilters = {}): Promise<UtmResponseDto[]> {
        const shouldFilter = Array.isArray(groups) && groups.length > 0;
        const tasks = shouldFilter ? await this.utmUtil.getTasksByActionTypes(groups) : await this.taskEntity.findAll();

        return tasks.map((task) => this.utmUtil.constructResponse(task));
    }
}
