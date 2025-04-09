/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import {
    ApplicationStatusDisplayValueEnum,
    ApplicationTypeEnum,
    DynamoApplicationEntity,
    UserEntity,
} from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { ApplicationQuery } from './application.query';
import { ApplicationDto, ApplicationProductDto, AssignedUserDto, SimplifiedApplicationDto } from './dto';
import { ProductIDEnum } from './enums';
import { AdditionalProductData, AmpApplication } from './interfaces';

@Injectable()
export class ApplicationUtil {
    constructor(
        private readonly applicationQuery: ApplicationQuery,
        private readonly applicationEntity: DynamoApplicationEntity,
        private readonly userEntity: UserEntity,
    ) {}

    /**
     * @description Format application
     * @param {AmpApplication} application
     * @returns {Promise<ApplicationDto>}
     */
    async formatApplication(application: AmpApplication): Promise<ApplicationDto> {
        const {
            item_id,
            product_ids,
            effective_date,
            project_end_date,
            last_updated,
            last_status_update,
            first_bound_date,
        } = application;

        const additionalProductData = await this.applicationQuery.getAdditionalProductDataByAppID(String(item_id));
        const assignedUserIDs = await this.applicationQuery.getTaskUserIDsByAppID(String(item_id));
        const assignedUsers = await Promise.all(
            assignedUserIDs.map(({ assigned_to }) => this.constructAssignedUserObj(assigned_to)),
        );
        const products = await this.getApplicationProducts(application);
        const policy = await this.applicationQuery.findPolicyByAppID(String(item_id));

        const foundProductData = additionalProductData.find(({ product_id }) => product_id === product_ids);
        const productData = foundProductData ? JSON.parse(foundProductData.data) : {};
        const expirationDate = this.determineExpirationDate(
            effective_date,
            product_ids as ProductIDEnum,
            productData,
            project_end_date,
        );

        const effectiveDate = effective_date ? this.formatDate(effective_date) : '';
        const updatedDate = last_updated ? this.formatDate(application.last_updated) : '';
        const lastStatusUpdate = last_status_update ? this.formatDate(application.last_status_update) : updatedDate;
        const boundDate = first_bound_date ? this.formatDate(first_bound_date) : '';
        const isMarketplaceApp = application.program_type_id === 22;
        const marketplaceAppData = isMarketplaceApp ? await this.getMarketplaceAppData(String(item_id)) : {};

        return {
            id: String(application.item_id),
            submissionID: String(application.group_id || ''),
            insured: {
                firstName: application.insured_first_name || '',
                lastName: application.insured_last_name || '',
                companyName: application.insured_company_name || '',
                phoneNumber: application.insured_phone || '',
                email: application.insured_email || '',
                address: {
                    streetAddress: application.insured_address || '',
                    city: application.insured_city || '',
                    state: application.insured_state || '',
                    zip: application.insured_zip || '',
                },
            },
            products,
            agencyName: application.agency_name,
            agent: {
                id: String(application.user_id),
                name: `${application.user_first_name} ${application.user_last_name}`,
            },
            totalCost: Number(application.total_cost),
            type: application.created_from_renewal === 1 ? ApplicationTypeEnum.RENEWAL : ApplicationTypeEnum.NEW,
            status: application.status_name as ApplicationStatusDisplayValueEnum,
            isMarketplaceApp,
            isBundle: products.length > 1,
            assignedUsers,
            expirationDate,
            updatedDate,
            lastStatusUpdate,
            boundDate,
            createdDate: this.formatDate(application.created),
            claims: [],
            effectiveDate,
            policyNumber: policy?.policy_number || '',
            ...marketplaceAppData,
        };
    }

    /**
     * @description Format an application object into a simplified shape for list display.
     * @param {AmpApplication} application - The application to be simplified.
     * @return {SimplifiedApplicationDto} A simplified application response shape.
     */
    async formatSimplifiedApplication(application: AmpApplication): Promise<SimplifiedApplicationDto> {
        const products = await this.getApplicationProducts(application);
        const assignedUserIDs = await this.applicationQuery.getTaskUserIDsByAppID(String(application.item_id));
        const assignedUsers = await Promise.all(
            assignedUserIDs.map(({ assigned_to }) => this.constructAssignedUserObj(assigned_to)),
        );
        const isMarketplaceApp = application.program_type_id === 22;
        const marketplaceAppData = isMarketplaceApp
            ? await this.getMarketplaceAppData(String(application.item_id))
            : {};

        return {
            id: String(application.item_id),
            submissionID: '', // will be set by marketplace data if it's a marketplace app
            insured: {
                firstName: application.insured_first_name || '',
                lastName: application.insured_last_name || '',
                companyName: application.insured_company_name || '',
                phoneNumber: application.insured_phone || '',
                email: application.insured_email || '',
                address: {
                    streetAddress: application.insured_address || '',
                    city: application.insured_city || '',
                    state: application.insured_state || '',
                    zip: application.insured_zip || '',
                },
            },
            products,
            agencyName: application.agency_name || '',
            type: application.created_from_renewal === 1 ? ApplicationTypeEnum.RENEWAL : ApplicationTypeEnum.NEW,
            assignedUsers: assignedUsers,
            status: application.status_name as ApplicationStatusDisplayValueEnum,
            isMarketplaceApp,
            isBundle: (products.length || 0) > 1,
            totalCost: Number(application.total_cost),
            effectiveDate: this.formatDate(application.effective_date) || '',
            lastStatusUpdate: this.formatDate(application.last_status_update) || '',
            ...marketplaceAppData,
        };
    }

    /**
     * @description Handle user assignment
     * @param {string} id
     * @param {string[]} userIDs
     * @returns {Promise<void>}
     */
    async handleUnderwriterAssignment(id: string, userIDs: string[]): Promise<void> {
        if (userIDs.length === 0) return this.applicationQuery.unassignAllUnderwritersFromApplication(id);

        return this.applicationQuery.assignUnderwritersToApplication(id, userIDs);
    }

    /**
     * @description Format date to YYYY-MM-DD
     * @param {string} date
     * @returns {string}
     */
    formatDate(date: string): string {
        return new Date(date).toISOString().split('T')[0];
    }

    /**
     * @description Get marketplace application data
     * @param {string} id
     * @returns {Promise<Partial<ApplicationDto>>}
     */
    private async getMarketplaceAppData(id: string): Promise<Partial<ApplicationDto>> {
        const application = await this.applicationEntity.findOne(id);
        const effectiveDate = application?.effectiveDate ? this.formatDate(application?.effectiveDate) : '';
        const expirationDate = application?.expirationDate ? this.formatDate(application?.expirationDate) : '';
        const boundDate = application?.boundDate ? this.formatDate(application?.boundDate) : '';
        const policyNumber = application?.policyNo || '';

        return {
            boundDate,
            effectiveDate,
            expirationDate,
            policyNumber,
            submissionID: application?.submissionID || '',
        };
    }

    /**
     * @description Construct assigned user object
     * @param {string} userID
     * @returns {Promise<AssignedUserDto>}
     */
    private async constructAssignedUserObj(userID: string): Promise<AssignedUserDto> {
        const user = await this.userEntity.getUserByID(userID);

        return {
            id: String(user.user_id),
            firstName: user.first_name,
            lastName: user.last_name,
        };
    }

    /**
     * @description Get application products
     * @param {AmpApplication} application
     * @returns {Promise<ApplicationProductDto[]>}
     */
    private async getApplicationProducts(application: AmpApplication): Promise<ApplicationProductDto[]> {
        const { item_id, product_ids, product_name, program_id, program_type_id, carrier_name } = application;
        const products = [
            {
                id: String(product_ids),
                name: product_name,
                programID: String(program_id),
                programTypeID: String(program_type_id),
                carrierName: carrier_name,
            },
        ];

        const linkedProducts = await this.applicationQuery.getLinkedProductsByAppID(String(item_id));

        return products.concat(
            linkedProducts.map(({ product_id, product_name, program_id, program_type_id, carrier_name }) => ({
                id: String(product_id),
                name: product_name,
                programID: String(program_id),
                programTypeID: String(program_type_id),
                carrierName: carrier_name,
            })),
        );
    }

    /**
     * @description Determine expiration date
     * @param {string} effectiveDate
     * @param {string} productID
     * @returns {string}
     */
    private determineExpirationDate(
        effectiveDate: string,
        productID: ProductIDEnum,
        additionalProductData: AdditionalProductData,
        exposureEndDate?: string,
    ): string {
        if (!effectiveDate) return '';

        const nextYearDate = new Date(effectiveDate);

        nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
        // TODO: change logic for different products
        // if (productID === ProductIDEnum.EQUIPMENT && additionalProductData.im_policy_duration) {
        // }
        // if (productID === ProductIDEnum.BUILDERS_RISK && additionalProductData.br_policy_duration) {
        // }
        // if (productID === ProductIDEnum.PROJECT_SPECIFIC && exposureEndDate) {
        // }

        return this.formatDate(nextYearDate.toString());
    }
}
