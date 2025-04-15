/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import {
    AclRoleEntity,
    AmpRolesEnum,
    ApplicationStatusDisplayValueEnum,
    ApplicationTypeEnum,
    DynamoApplicationEntity,
    DynamoNoteEntity,
    EmailTrackingEntity,
    EmailTrackingModel,
    IJWT,
    NoteAuthorDto,
    NoteAuthorRoleEnum,
    NoteCategoryEnum,
    NoteEntityTypeEnum,
    NoteNotificationTypeEnum,
    SanitizeOptions,
    UserEntity,
    sanitizeHtml,
} from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { ApplicationQuery } from './application.query';
import {
    ApplicationDto,
    ApplicationProductDto,
    AssignedUserDto,
    EmailDto,
    NoteDto,
    SimplifiedApplicationDto,
} from './dto';
import { NoteTypeEnum, ProductIDEnum } from './enums';
import { AdditionalProductData, AmpApplication } from './interfaces';

@Injectable()
export class ApplicationUtil {
    private readonly sanitizerOptions: SanitizeOptions = {
        allowedAttributes: {
            '*': ['style'],
            a: ['href'],
        },
    };

    constructor(
        private readonly applicationQuery: ApplicationQuery,
        private readonly applicationEntity: DynamoApplicationEntity,
        private readonly userEntity: UserEntity,
        private readonly aclRoleEntity: AclRoleEntity,
        private readonly noteEntity: DynamoNoteEntity,
        private readonly emailTrackingEntity: EmailTrackingEntity,
    ) {}

    /**
     * @description Format application
     * @param {AmpApplication} application
     * @param {IJWT} user - the requesting user
     * @returns {Promise<ApplicationDto>}
     */
    async formatApplication(application: AmpApplication, user: IJWT): Promise<ApplicationDto> {
        const { item_id, product_ids, effective_date, project_end_date, last_updated, first_bound_date } = application;

        const additionalProductData = await this.applicationQuery.getAdditionalProductDataByAppID(String(item_id));
        const policy = await this.applicationQuery.findPolicyByAppID(String(item_id));

        const foundProductData = additionalProductData.find(({ product_id }) => product_id === product_ids);
        const productData = foundProductData ? JSON.parse(foundProductData.data) : {};
        const expirationDate = this.determineExpirationDate(
            effective_date,
            product_ids as ProductIDEnum,
            productData,
            project_end_date,
        );
        const updatedDate = last_updated ? this.formatDate(application.last_updated) : '';
        const boundDate = first_bound_date ? this.formatDate(first_bound_date) : '';
        const isMarketplaceApp = application.program_type_id === 22;
        const emails = !isMarketplaceApp ? await this.getAmpEmails(String(item_id)) : [];
        const baseFormattedAppData = await this.getBaseFormattedApplicationData(application);
        const notes = isMarketplaceApp
            ? await this.getMarketplaceNotes(String(item_id), baseFormattedAppData.submissionID, user.roles)
            : await this.getAmpNotes(String(item_id));

        return {
            policyNumber: policy?.policy_number || '',
            expirationDate,
            updatedDate,
            boundDate,
            ...baseFormattedAppData, // contains values that will override the above values for marketplace apps
            agent: {
                id: String(application.user_id),
                name: `${application.user_first_name} ${application.user_last_name}`,
            },
            createdDate: this.formatDate(application.created),
            claims: [],
            emails,
            notes,
        };
    }

    /**
     * @description Get base formatted application data
     * @param {AmpApplication} application - The AMP application object
     * @returns {Promise<SimplifiedApplicationDto>}
     */
    async getBaseFormattedApplicationData(application: AmpApplication): Promise<SimplifiedApplicationDto> {
        const products = await this.getApplicationProducts(application);
        const assignedUsers = await this.getFormattedAssignedUsers(application.item_id);
        const isMarketplaceApp = application.program_type_id === 22;
        const marketplaceAppData = isMarketplaceApp
            ? await this.getMarketplaceAppData(String(application.item_id))
            : {};

        const effectiveDate = application.effective_date ? this.formatDate(application.effective_date) : '';
        const lastStatusUpdate = application.last_status_update ? this.formatDate(application.last_status_update) : '';

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
            agencyName: application.agency_name || '',
            type: application.created_from_renewal === 1 ? ApplicationTypeEnum.RENEWAL : ApplicationTypeEnum.NEW,
            assignedUsers,
            status: application.status_name as ApplicationStatusDisplayValueEnum,
            isMarketplaceApp,
            isBundle: products.length > 1,
            totalCost: Number(application.total_cost),
            effectiveDate,
            lastStatusUpdate,
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
     * @description formet assigned users for a given appID
     * @param {number} item_id The application ID
     * @returns {Promise<Partial<ApplicationDto>>} A list of formatted assigned users
     */
    private async getFormattedAssignedUsers(item_id: number): Promise<AssignedUserDto[]> {
        const assignedUserIDs = await this.applicationQuery.getTaskUserIDsByAppID(String(item_id));

        const users = await Promise.all(
            assignedUserIDs.map(({ assigned_to }) => this.constructAssignedUserObj(assigned_to)),
        );

        return users.filter((u): u is AssignedUserDto => u !== null);
    }

    /**
     * @description Get marketplace notes for a given appID
     * @param {string} appID The application ID
     * @param {string} submissionID The submission ID
     * @param {IJWT['roles']} userRoles The user roles
     * @returns {Promise<NoteDto[]>} A list of formatted notes
     */
    private async getMarketplaceNotes(
        appID: string,
        submissionID: string,
        userRoles: IJWT['roles'],
    ): Promise<NoteDto[]> {
        const authorCache: { [userID: string]: Promise<NoteAuthorDto> } = {};
        const includeInternal = userRoles.includes(AmpRolesEnum.UNDERWRITER);
        const appNotes = await this.noteEntity.findAllByEntity(appID, NoteEntityTypeEnum.APPLICATION, includeInternal);
        const submissionNotes = await this.noteEntity.findAllByEntity(
            submissionID,
            NoteEntityTypeEnum.SUBMISSION,
            includeInternal,
        );
        const notes = [...appNotes, ...submissionNotes];

        notes.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());

        return Promise.all(
            notes.map(async ({ userID, ...note }) => {
                const author = await (authorCache[userID] ||= this.getNoteAuthor(userID));

                return {
                    id: note.id,
                    entityType: note.entityType,
                    entityID: note.entityID,
                    category: note.category,
                    createdBy: note.createdBy || `${author.firstName} ${author.lastName}`,
                    content: note.isActive ? sanitizeHtml(note.content, this.sanitizerOptions) : '',
                    updatedDate: note.updatedDate,
                    createdDate: note.createdDate,
                    notify: note.notify || [],
                    isActive: note.isActive,
                    author,
                    isInternal: note.isInternal || false,
                    parentNoteID: note.parentNoteID,
                    type: NoteTypeEnum.DEFAULT,
                };
            }),
        );
    }

    /**
     * * @description Get AMP notes for a given appID
     * * @param {string} appID The application ID
     * * @returns {Promise<NoteDto[]>} A list of formatted notes
     * */
    private async getAmpNotes(appID: string): Promise<NoteDto[]> {
        const notes = await this.applicationQuery.getAmpNotesByAppID(appID);

        notes.sort((a, b) => new Date(a.written).getTime() - new Date(b.written).getTime());

        return notes.map((note) => {
            const notify: NoteNotificationTypeEnum[] = [
                ...(note.sent_to_producer === 1 ? [NoteNotificationTypeEnum.PRODUCER] : []),
                ...(note.sent_to_underwriter === 1 ? [NoteNotificationTypeEnum.UNDERWRITER] : []),
            ];
            const creatorFirstName = note.first_name || 'Lance';
            const creatorLastName = note.last_name || 'Bishop';
            const isInternal = note.sent_to_producer === 0 && note.sent_to_underwriter === 0;

            return {
                id: String(note.note_id),
                entityID: appID,
                entityType: NoteEntityTypeEnum.APPLICATION,
                category: NoteCategoryEnum.DETAIL_VIEW,
                notify,
                content: sanitizeHtml(note.note || '', this.sanitizerOptions),
                author: {
                    id: String(note.user_id),
                    firstName: creatorFirstName,
                    lastName: creatorLastName,
                    role: note.acl_role_id === 6 ? NoteAuthorRoleEnum.UNDERWRITER : NoteAuthorRoleEnum.PRODUCER,
                },
                createdBy: `${creatorFirstName} ${creatorLastName}`, // deprecated, to be removed
                parentNoteID: note.parent_note_id ? String(note.parent_note_id) : undefined,
                isActive: note.entry_status === 'Active',
                isInternal,
                type: note.user_id === 0 ? NoteTypeEnum.SYSTEM_ONLY : NoteTypeEnum.DEFAULT,
                updatedDate: note.written,
                createdDate: note.written,
            };
        });
    }

    /**
     * @description Get AMP emails for a given appID
     * @param {string} appID The application ID
     * @returns {Promise<EmailDto[]>} A list of formatted emails
     */
    private async getAmpEmails(appID: string): Promise<EmailDto[]> {
        const rawEmails = await this.emailTrackingEntity.getByEntityID(appID, 'omga_items');

        return rawEmails.map((email: EmailTrackingModel) => ({
            id: String(email.email_tracking_id),
            sender: email.from_address,
            recipients: email?.to_address?.split(',') || [],
            subject: email.subject || '',
            body: sanitizeHtml(email.body_html || '', this.sanitizerOptions),
            sentAt: email.sent_at,
        }));
    }

    /**
     * @description Get the author DTO for a user
     * @param {string} userID
     * @returns {Promise<NoteAuthorDto>}
     */
    private async getNoteAuthor(userID: string): Promise<NoteAuthorDto> {
        const user = await this.userEntity.getUserByID(userID);
        const roles = await this.aclRoleEntity.getRolesForUser(Number(userID));

        return {
            firstName: user.first_name || 'System',
            lastName: user.last_name || 'User',
            role: roles.includes(AmpRolesEnum.UNDERWRITER)
                ? NoteAuthorRoleEnum.UNDERWRITER
                : NoteAuthorRoleEnum.PRODUCER,
        };
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
            submissionID: application?.submissionID || '',
            boundDate,
            effectiveDate,
            expirationDate,
            policyNumber,
        };
    }

    /**
     * @description Construct assigned user object
     * @param {string} userID
     * @returns {Promise<AssignedUserDto>}
     */
    private async constructAssignedUserObj(userID: string): Promise<AssignedUserDto> {
        const user = await this.userEntity.getUserByID(userID);

        if (!user) return null;

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
