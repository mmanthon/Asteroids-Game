/* eslint-disable camelcase */
import { DynamoTaskEntity } from '@ignidus/iscx-backend-utils';
import { Injectable, Logger } from '@nestjs/common';

import { CreateTaskRequestDto, TaskFilters, UtmResponseDto } from './dto';
import { UtmQuery } from './utm.query';
import { UtmUtil } from './utm.util';

@Injectable()
export class UtmService {
    private readonly logger = new Logger(UtmService.name);

    constructor(
        private readonly utmUtil: UtmUtil,
        private readonly utmQuery: UtmQuery,
        private readonly taskEntity: DynamoTaskEntity,
    ) {}

    /**
     * @description Create task
     * @param {CreateTaskRequestDto} request
     * @returns {Promise<void>}
     */
    async create(request: CreateTaskRequestDto): Promise<void> {
        const excludedStatusIDs = [2, 11, 31, 32, 34, 50];
        const emailTrackingRecord = await this.utmUtil.validateEmailRecord(request.emailID);
        const { entity_id, subject } = emailTrackingRecord;

        // Get application by id
        const application = await this.utmQuery.getApplicationByID(String(entity_id));

        // If application status is not valid, skip create task
        if (excludedStatusIDs.includes(application.statusID)) {
            this.logger.warn(`Application status is not valid. Skipping create task. ${JSON.stringify(application)}`);

            return;
        }

        this.logger.log(
            `Processing create task: ${JSON.stringify(request)}.Application: ${JSON.stringify(application)}`,
        );

        const newTask = this.utmUtil.buildTaskPayload(application, request.actionType);

        this.utmUtil.addGroups(newTask);
        this.utmUtil.addTags(application, newTask, subject);
        await this.utmUtil.addLinkedProducts(newTask);
        await this.utmUtil.addLinkedProgramTypes(newTask);
        await this.utmUtil.autoAssign(newTask);

        // create task in dynamodb
        const createdTask = await this.taskEntity.create(newTask);

        // send created task to websocket
        await this.utmUtil.sendTasksToWebsocket([createdTask]);
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
