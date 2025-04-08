import { Injectable } from '@nestjs/common';

import { ApplicationQuery } from './application.query';
import { ApplicationUtil } from './application.util';
import { ApplicationDto, FilterParamDto, FindAllResponseDto, UpdateApplicationRequestDto } from './dto';

@Injectable()
export class ApplicationService {
    constructor(
        private readonly applicationQuery: ApplicationQuery,
        private readonly applicationUtil: ApplicationUtil,
    ) {}

    /**
     * @description Get all applications
     * @param {FilterParamDto} filters
     * @returns {Promise<FindAllResponseDto>}
     */
    async findAll(filters: FilterParamDto): Promise<FindAllResponseDto> {
        const { applications, ...pagination } = await this.applicationQuery.findAll(filters);

        const formattedApplications = await Promise.all(
            applications.map((application) => this.applicationUtil.formatSimplifiedApplication(application)),
        );

        return {
            applications: formattedApplications,
            pagination,
        };
    }

    /**
     * @description Get one application
     * @param {string} id
     * @returns {Promise<ApplicationDto>}
     */
    async findOne(id: string): Promise<ApplicationDto> {
        const application = await this.applicationQuery.findOne(id);

        return this.applicationUtil.formatApplication(application);
    }

    /**
     * @description Update application
     * @param {string} id
     * @param {UpdateApplicationRequestDto} updateParam
     * @returns {Promise<ApplicationDto>}
     */
    async updateOne(id: string, updateParam: UpdateApplicationRequestDto): Promise<ApplicationDto> {
        const { underwriterUserIDs, agentID } = updateParam;

        // Assign users to application
        if (underwriterUserIDs) await this.applicationUtil.handleUnderwriterAssignment(id, underwriterUserIDs);

        // Update agent
        if (agentID) await this.applicationQuery.assignAgentToApplication(id, agentID);

        const application = await this.applicationQuery.findOne(id);

        return this.applicationUtil.formatApplication(application);
    }
}
