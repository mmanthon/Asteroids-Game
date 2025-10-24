/* eslint-disable camelcase */
import { Lambda } from '@aws-sdk/client-lambda';
import {
    AmpEmailActionTypeEnum,
    AmpEmailActionTypeLabelEnum,
    CreateUTMTaskParams,
    DynamoTaskEntity,
    EmailTrackingEntity,
    EmailTrackingModel,
    ItemLinkedProductEntity,
    TaskDynamoModel,
    TaskStatusEnum,
    UtmGroupEnum,
    taskGroupMapping,
} from '@ignidus/iscx-backend-utils';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UtmResponseDto } from './dto';
import { IAmpApplication } from './interface';
import { UtmQuery } from './utm.query';

@Injectable()
export class UtmUtil {
    private readonly logger = new Logger(UtmUtil.name);
    private readonly lambdaClient: Lambda;

    constructor(
        private readonly taskEntity: DynamoTaskEntity,
        private readonly utmQuery: UtmQuery,
        private readonly itemLinkedProductsEntity: ItemLinkedProductEntity,
        private readonly emailTrackingEntity: EmailTrackingEntity,
        private readonly configService: ConfigService,
    ) {
        this.lambdaClient = new Lambda({ region: this.configService.get<string>('awsRegion') });
    }

    /**
     * @description Construct response
     * @param {TaskDynamoModel} task
     * @returns {UtmResponseDto}
     */
    constructResponse(task: TaskDynamoModel): UtmResponseDto {
        return {
            ...task,
            updatedBy: task.updatedBy || '',
            groups: task.groups || [],
        };
    }

    /**
     * @description Get tasks by action types
     * @param {UtmGroupEnum[]} groups
     * @returns {Promise<TaskDynamoModel[]>}
     */
    async getTasksByActionTypes(groups: UtmGroupEnum[]): Promise<TaskDynamoModel[]> {
        const tasks = await Promise.all(
            groups.flatMap((group) => {
                const actionTypes = this.getActionTypesByGroup(group);

                return actionTypes.map((actionType) =>
                    this.taskEntity.findTasksByActionType(actionType as AmpEmailActionTypeLabelEnum),
                );
            }),
        );

        return tasks.flat();
    }

    /**
     * @description Validate email record
     * @param {string} emailID
     * @returns {Promise<EmailTrackingModel>}
     */
    async validateEmailRecord(emailID: string): Promise<EmailTrackingModel> {
        const emailTrackingRecord = await this.emailTrackingEntity.getEmailRecordByID(Number(emailID));

        if (!emailTrackingRecord) throw new NotFoundException(`Email record with id ${emailID} not found`);

        return emailTrackingRecord;
    }

    /**
     * @description Auto assign task
     * @param {CreateUTMTaskParams} task
     * @returns {Promise<void>}
     */
    async autoAssign(task: CreateUTMTaskParams): Promise<void> {
        // If a task is pending bind, do not auto assign
        if (task.actionType === AmpEmailActionTypeLabelEnum.pendingBind) return;
        const existingTask = await this.taskEntity.findAllByAppID(task.appID);
        const inProgressTask = existingTask.find(({ status }) => status === TaskStatusEnum.IN_PROGRESS);

        if (!inProgressTask) return;

        this.logger.log(
            `Found a task ${inProgressTask.id} with the same appID ${
                inProgressTask.appID
            }, initiating auto assign for the new task  ${JSON.stringify(task)}`,
        );
        task.assignedUser = inProgressTask.assignedUser;
        task.status = inProgressTask.status;
    }

    /**
     * @description Add linked products
     * @param {CreateUTMTaskParams} task
     * @returns {Promise<void>}
     */
    async addLinkedProducts(task: CreateUTMTaskParams): Promise<void> {
        const linkedProducts = await this.itemLinkedProductsEntity.getRecordsByAppID(Number(task.appID));
        const foundLinkedProducts = linkedProducts.map(({ product_id, name }) => ({
            id: String(product_id),
            label: name,
        }));

        task.products = [...task.products, ...foundLinkedProducts];
    }

    /**
     * @description Add linked program types
     * @param {CreateUTMTaskParams} task
     * @returns {Promise<void>}
     */
    async addLinkedProgramTypes(task: CreateUTMTaskParams): Promise<void> {
        for (const product of task.products) {
            const program = await this.utmQuery.getLinkedProgramType(product.id);

            if (!program) {
                this.logger.error(`Program not found for task ${JSON.stringify(task)}`);
                continue;
            }

            task.programTypes.push({ id: String(program.programTypeID), label: program.programTypeName });
        }
    }

    /**
     * @description Add groups to task
     * @param {CreateUTMTaskParams} task
     * @returns {void}
     */
    addGroups(task: CreateUTMTaskParams): void {
        switch (task.actionType) {
            case AmpEmailActionTypeLabelEnum.pendingBind:
            case AmpEmailActionTypeLabelEnum.approval:
            case AmpEmailActionTypeLabelEnum.note:
            case AmpEmailActionTypeLabelEnum.upload:
            case AmpEmailActionTypeLabelEnum.uwBindReview:
                task.groups.push(UtmGroupEnum.PRE_BIND);
                break;
        }
    }

    /**
     * @description Send tasks to websocket
     * @param {TaskDynamoModel[]} tasks
     * @returns {Promise<void>}
     */
    async sendTasksToWebsocket(tasks: TaskDynamoModel[]): Promise<void> {
        await this.lambdaClient.invoke({
            FunctionName: this.configService.get<string>('sendTasksToWSFunctionName'),
            Payload: JSON.stringify(tasks),
            InvocationType: 'Event',
        });
    }

    /**
     * @description Add tags to task
     * @param {IAmpApplication} application
     * @param {CreateUTMTaskParams} task
     * @param {string} subject
     * @returns {void}
     */
    async addTags(application: IAmpApplication, task: CreateUTMTaskParams, subject: string): Promise<void> {
        const depositRequiredAgencies = await this.utmQuery.getDepositRequiredAgencies();
        const { exposureID, agencyID } = application;
        const agencyFound = depositRequiredAgencies.find(({ agency_id }) => agency_id === agencyID);

        if (exposureID) {
            const exposureData = await this.utmQuery.getExposureData(exposureID);

            if (exposureData && exposureData.losses_last_5_years && exposureData.losses_last_5_years > 0) {
                task.tags.push('Claims');
            }
        }

        if (agencyFound) {
            task.tags.push('Deposit required');
        }
        if (subject.includes('[6065]') || subject.includes('[8140]')) {
            task.tags.push('priority_agency');
        }
        if (subject.includes('[2237]')) {
            task.tags.push('ccis');
        }
        if (subject.includes('[7362]')) {
            task.tags.push('gaslamp');
        }
        if (subject.includes('[POSTBIND]')) {
            task.tags.push('post_bind_upload');
        }
        if (subject.includes('[REN]')) {
            task.tags.push('Renewal');
        }
        if (subject.includes('[PREMRANK1]')) {
            task.tags.push('PremRank1');
        }
    }

    /**
     * @description Build task payload
     * @param {IAmpApplication} application
     * @param {AmpEmailActionTypeEnum} actionType
     * @returns {TaskDynamoModel}
     */
    buildTaskPayload(application: IAmpApplication, actionType: AmpEmailActionTypeEnum): CreateUTMTaskParams {
        return {
            appID: String(application.appID),
            status: TaskStatusEnum.NOT_STARTED,
            isNew: true,
            assignedUser: {
                id: '',
                fname: '',
                lname: '',
            },
            companyName: application.insuredCompanyName,
            products: [{ id: String(application.productID), label: application.productLabel }],
            programTypes: [],
            actionType: AmpEmailActionTypeLabelEnum[actionType],
            agency: { id: String(application.agencyID), label: application.agencyName },
            tags: [],
            groups: [],
            updatedBy: '',
            position: 1,
        };
    }

    /**
     * @description Get action types by group
     * @param {UtmGroupEnum} group
     * @returns {string[]}
     */
    private getActionTypesByGroup(group: UtmGroupEnum): string[] {
        return (
            Object.entries(taskGroupMapping)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
                .filter(([_, mappedGroup]) => mappedGroup === group)
                .map(([actionType]) => actionType)
        );
    }
}
