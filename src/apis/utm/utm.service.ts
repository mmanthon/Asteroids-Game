import { SQS } from '@aws-sdk/client-sqs';
import { DynamoTaskEntity, EmailTrackingEntity } from '@ignidus/iscx-backend-utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnqueueRequestDto, TaskFilters, UtmResponseDto } from './dto';
import { UtmUtil } from './utm.util';

@Injectable()
export class UtmService {
    private sqsClient: SQS;

    constructor(
        private readonly utmUtil: UtmUtil,
        private readonly taskEntity: DynamoTaskEntity,
        private readonly configService: ConfigService,
        private readonly emailTrackingEntity: EmailTrackingEntity,
    ) {
        this.sqsClient = new SQS({
            region: this.configService.get<string>('awsRegion'),
        });
    }

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

        await this.sqsClient.sendMessage({
            QueueUrl: this.configService.get<string>('queueUrl'),
            MessageBody: JSON.stringify(body),
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
