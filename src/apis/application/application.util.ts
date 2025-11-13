/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import {
    AclRoleEntity,
    AmpRolesEnum,
    ApplicationDynamoModel,
    ApplicationStatusDisplayValueEnum,
    ApplicationStatusNameEnum,
    ApplicationTypeEnum,
    AutoDeclineConditionTypeEnum,
    DOCUMENT_CLASSIFICATION_SYSTEM_DEFAULT_VALUE,
    DocumentClassificationEntity,
    DynamoApplicationEntity,
    DynamoAutoDeclinationHistoryEntity,
    DynamoEmailHistoryEntity,
    DynamoNoteEntity,
    DynamoProductEntity,
    DynamoProductVersionEntity,
    EmailHistoryDynamoModel,
    EmailTrackingEntity,
    EmailTrackingModel,
    IJWT,
    NoteAuthorDto,
    NoteAuthorRoleEnum,
    NoteCategoryEnum,
    NoteEntityTypeEnum,
    NoteNotificationTypeEnum,
    ProductDynamoModel,
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
    AutoDeclinationHistoryDto,
    EmailDto,
    NoteDto,
    SimplifiedApplicationDto,
} from './dto';
import { NoteTypeEnum, ProductIDEnum } from './enums';
import { AdditionalProductData, AmpApplication } from './interfaces';

@Injectable()
export class ApplicationUtil {
    private readonly emailSanitizerOptions: SanitizeOptions = {
        allowedAttributes: {
            '*': ['style'],
            a: ['href', 'target'],
        },
        allowedStyles: {
            '*': {
                'font-size': [/^\d+(px|em|rem|%)$/],
                'font-weight': [/^(normal|bold|[1-9]00)$/],
                'font-style': [/^(normal|italic|oblique)$/],
                'text-align': [/^(left|right|center|justify)$/],
                'text-decoration': [/^(none|underline|line-through)$/],
                'font-family': [/^[\w\s,-]+$/],
                'line-height': [/^\d+(px|em|rem|%|)$/],
                margin: [/^(auto|\d+(px|em|rem|%))$/],
                'margin-top': [/^(auto|\d+(px|em|rem|%))$/],
                'margin-right': [/^(auto|\d+(px|em|rem|%))$/],
                'margin-bottom': [/^(auto|\d+(px|em|rem|%))$/],
                'margin-left': [/^(auto|\d+(px|em|rem|%))$/],
                padding: [/^\d+(px|em|rem|%)$/],
                'padding-top': [/^\d+(px|em|rem|%)$/],
                'padding-right': [/^\d+(px|em|rem|%)$/],
                'padding-bottom': [/^\d+(px|em|rem|%)$/],
                'padding-left': [/^\d+(px|em|rem|%)$/],
                'border-collapse': [/^(collapse|separate)$/],
                'border-spacing': [/^\d+(px|em|rem|%)$/],
                'vertical-align': [/^(baseline|sub|super|top|text-top|middle|bottom|text-bottom)$/],
            },
        },
    };
    private readonly noteSanitizerOptions: SanitizeOptions = {
        allowedTags: [],
        allowedAttributes: {},
    };

    constructor(
        private readonly applicationQuery: ApplicationQuery,
        private readonly applicationEntity: DynamoApplicationEntity,
        private readonly userEntity: UserEntity,
        private readonly aclRoleEntity: AclRoleEntity,
        private readonly noteEntity: DynamoNoteEntity,
        private readonly emailTrackingEntity: EmailTrackingEntity,
        private readonly emailHistoryEntity: DynamoEmailHistoryEntity,
        private readonly autoDeclinationHistoryEntity: DynamoAutoDeclinationHistoryEntity,
        private readonly productEntity: DynamoProductEntity,
        private readonly productVersionEntity: DynamoProductVersionEntity,
        private readonly documentClassificationEntity: DocumentClassificationEntity,
    ) {}

    /**
     * @description Format application
     * @param {AmpApplication} application
     * @param {IJWT} user - the requesting user
     * @param {Object} productCache - Optional request-scoped cache for product data (used in batch operations)
     * @returns {Promise<ApplicationDto>}
     */
    async formatApplication(
        application: AmpApplication,
        user: IJWT,
        productCache?: { [key: string]: ProductDynamoModel },
    ): Promise<ApplicationDto> {
        const { item_id, last_updated } = application;
        const updatedDate = last_updated ? this.formatDate(application.last_updated) : '';
        const isMarketplaceApp = application.program_type_id === 22;

        const [agent, policy, baseFormattedAppData, emails] = await Promise.all([
            this.applicationQuery.getAgentInfoByUserId(String(application.user_id)),
            this.applicationQuery.findPolicyByAppID(String(item_id)),
            this.getBaseFormattedApplicationData(application, productCache),
            isMarketplaceApp ? this.getMarketplaceEmails(String(item_id)) : this.getAmpEmails(String(item_id)),
        ]);

        const notes = isMarketplaceApp
            ? await this.getMarketplaceNotes(String(item_id), baseFormattedAppData.submissionID, user.roles)
            : await this.getAmpNotes(String(item_id));

        return {
            policyNumber: policy?.policy_number ?? '',
            updatedDate,
            autoDeclinationHistory: [],
            ...baseFormattedAppData, // contains values that will override the above values for marketplace apps
            agent,
            claims: [],
            emails,
            notes,
        };
    }

    /**
     * @description Get base formatted application data
     * @param {AmpApplication} application - The AMP application object
     * @param {Object} productCache - Optional request-scoped cache for product data (used in batch operations)
     * @returns {Promise<SimplifiedApplicationDto>}
     */
    async getBaseFormattedApplicationData(
        application: AmpApplication,
        productCache?: { [key: string]: ProductDynamoModel },
    ): Promise<SimplifiedApplicationDto> {
        const { item_id, product_ids, effective_date, project_end_date, first_bound_date } = application;
        const isMarketplaceApp = application.program_type_id === 22;
        const dynamoApplication = isMarketplaceApp
            ? await this.applicationEntity.findOne(String(application.item_id))
            : undefined;

        const products = await this.getApplicationProducts(application, dynamoApplication, productCache);

        const [additionalProductData, assignedUsers, marketplaceAppData] = await Promise.all([
            this.applicationQuery.getAdditionalProductDataByAppID(String(item_id)),
            this.getFormattedAssignedUsers(application.item_id),
            isMarketplaceApp ? this.getMarketplaceAppData(dynamoApplication, productCache) : Promise.resolve({}),
        ]);

        const boundDate = first_bound_date ? this.formatDate(first_bound_date) : '';
        const effectiveDate = application.effective_date ? this.formatDate(application.effective_date) : '';
        const createdDate = this.formatDate(application.created);
        const lastStatusUpdate = application.last_status_update ? this.formatDate(application.last_status_update) : '';
        const foundProductData = additionalProductData.find(({ product_id }) => product_id === product_ids);
        const productData = foundProductData ? JSON.parse(foundProductData.data) : {};
        const expirationDate = this.determineExpirationDate(
            effective_date,
            product_ids as ProductIDEnum,
            productData,
            project_end_date,
        );
        const totalCost = application.total_cost ? Number(application.total_cost) : 0;

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
            totalCost,
            createdDate,
            effectiveDate,
            expirationDate,
            lastStatusUpdate,
            boundDate,
            pricing: {
                premium: 0,
                totalCost,
            },
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
                    content: note.isActive ? sanitizeHtml(note.content, this.noteSanitizerOptions).trim() : '',
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
                content: sanitizeHtml(note.note || '', this.noteSanitizerOptions).trim(),
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
            body: sanitizeHtml(email.body_html || '', this.emailSanitizerOptions),
            sentAt: email.sent_at,
        }));
    }

    /**
     * @description Get history emails for a given appID
     * @param {string} appID The application ID
     * @returns {Promise<EmailDto[]>} A list of formatted emails
     */
    private async getMarketplaceEmails(appID: string): Promise<EmailDto[]> {
        const emails = await this.emailHistoryEntity.findAllByEntityID(appID);

        return emails.map((email: EmailHistoryDynamoModel) => ({
            id: email.id,
            sender: email.sender,
            recipients: email?.recipients?.split(',').map((r) => r.trim()) || [],
            subject: email.subject || '',
            body: sanitizeHtml(email.body || '', this.emailSanitizerOptions),
            sentAt: email.sentAt,
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
     * @param {ApplicationDynamoModel} application
     * @param {Object} productCache - Optional request-scoped cache for product data (used in batch operations)
     * @returns {Promise<Partial<ApplicationDto>>}
     */
    private async getMarketplaceAppData(
        application: ApplicationDynamoModel,
        productCache?: { [key: string]: ProductDynamoModel },
    ): Promise<Partial<ApplicationDto>> {
        // if application is not found, return an empty object
        if (!application) return {};

        const product = await this.getCachedProduct(application.product.id, application.product.version, productCache);
        const autoDeclinationHistory = await this.getAutoDeclinationHistory(
            application.id,
            application.status,
            product,
        );

        const effectiveDate = application.effectiveDate ? this.formatDate(application.effectiveDate) : '';
        const expirationDate = application.expirationDate ? this.formatDate(application.expirationDate) : '';
        const boundDate = application.boundDate ? this.formatDate(application.boundDate) : '';
        const policyNumber = application.policyNo ?? '';
        const premium = this.extractPremiumFromApplication(application);

        return {
            submissionID: application.submissionID,
            boundDate,
            effectiveDate,
            expirationDate,
            policyNumber,
            pricing: {
                premium,
                totalCost: application.totalCost || 0,
            },
            autoDeclinationHistory,
        };
    }

    /**
     * @description  Extracts the premium value from the application's selected carrier pricing
     * @param {ApplicationDynamoModel} application - The application containing carrier information
     * @returns {number}
     */
    private extractPremiumFromApplication(application: ApplicationDynamoModel): number {
        if (
            !application?.carriers ||
            !application.carriers.selectedCarrierID ||
            !application.carriers.options?.length
        ) {
            return 0;
        }

        const selectedCarrierID = application.carriers.selectedCarrierID;
        const selectedCarrier = application.carriers.options.find((o) => o.id === selectedCarrierID);

        if (!selectedCarrier || !selectedCarrier.pricing?.length) {
            return 0;
        }

        const premiumAnswer = selectedCarrier.pricing
            ?.flatMap((p) => p.questions)
            ?.find((q) => q.source === 'uwpp_base_premium');

        return premiumAnswer ? Number(premiumAnswer.answer) : 0;
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
     * @param {AmpApplication} ampApplication
     * @param {ApplicationDynamoModel} [dynamoApplication] - The dynamo application object (optional)
     * @param {Object} productCache - Optional request-scoped cache for product data (used in batch operations)
     * @returns {Promise<ApplicationProductDto[]>}
     */
    private async getApplicationProducts(
        ampApplication: AmpApplication,
        dynamoApplication: ApplicationDynamoModel | undefined,
        productCache?: { [key: string]: ProductDynamoModel },
    ): Promise<ApplicationProductDto[]> {
        const { item_id, product_ids, product_name, program_id, program_type_id, carrier_name } = ampApplication;

        const [product, linkedProducts] = await Promise.all([
            dynamoApplication
                ? this.getCachedProduct(dynamoApplication.product.id, dynamoApplication.product.version, productCache)
                : Promise.resolve(null),
            this.applicationQuery.getLinkedProductsByAppID(String(item_id)),
        ]);

        // Build shared product info
        const sharedProductInfo = {
            isDirectToConsumer: product?.isDirectToConsumer ?? false,
            isAutoRiskSummarizationEnabled: product?.isAutoRiskSummarizationEnabled ?? false,
            documentClassificationOptions: [],
        };

        // If dynamo application is provided, get the document classification options
        if (dynamoApplication) {
            const documentClassificationOptions = await this.getDocumentClassificationOptions(
                dynamoApplication.product.id,
            );

            sharedProductInfo.documentClassificationOptions = documentClassificationOptions;
        }

        // Create main product
        const mainProduct: ApplicationProductDto = {
            id: String(product_ids),
            name: product_name,
            programID: String(program_id),
            programTypeID: String(program_type_id),
            carrierName: carrier_name,
            ...sharedProductInfo,
        };

        // Early return if no linked products
        if (linkedProducts.length === 0) {
            return [mainProduct];
        }

        // Create linked products with optimized mapping
        const linkedProductsDto: ApplicationProductDto[] = linkedProducts.map((product) => ({
            id: String(product.product_id),
            name: product.product_name,
            programID: String(product.program_id),
            programTypeID: String(product.program_type_id),
            carrierName: product.carrier_name,
            isDirectToConsumer: false,
            isAutoRiskSummarizationEnabled: false,
            documentClassificationOptions: [],
        }));

        return [mainProduct, ...linkedProductsDto];
    }

    /**
     * @description Get cached product data to avoid repeated database calls within a single request
     * @param {string} productID
     * @param {number} version
     * @param {Object} productCache - Optional request-scoped cache for product data (used in batch operations)
     * @returns {Promise<ProductDynamoModel>}
     */
    private async getCachedProduct(
        productID: string,
        version: number,
        productCache?: { [key: string]: ProductDynamoModel },
    ): Promise<ProductDynamoModel> {
        // If no cache provided, fetch directly
        if (!productCache) {
            return this.productEntity.findOneByVersion(productID, version);
        }

        const cacheKey = `${productID}-${version}`;

        // If we already have the resolved data in cache, return it immediately
        if (productCache[cacheKey]) {
            return productCache[cacheKey];
        }

        // Fetch the product and store the resolved data in cache
        const product = await this.productEntity.findOneByVersion(productID, version);

        productCache[cacheKey] = product;

        return product;
    }

    /**
     * @description Get the document classification options for a product
     * @param {string} productID
     * @returns {Promise<string[]>}
     */
    private async getDocumentClassificationOptions(productID: string): Promise<string[]> {
        const latestVersion = await this.productVersionEntity.findLatestVersionNumber(productID);

        // Fetch latest product and default classifications in parallel
        const [latestProduct, defaultDocumentClassifications] = await Promise.all([
            this.productEntity.findOneByVersion(productID, latestVersion),
            this.documentClassificationEntity.findAllByIndex({
                indexName: 'system-default-index',
                indexKey: 'systemDefault',
                indexValue: DOCUMENT_CLASSIFICATION_SYSTEM_DEFAULT_VALUE,
            }),
        ]);

        const { documentClassificationOptions: productDocumentClassifications = [] } = latestProduct;

        // Combine product classifications and default classifications
        const allClassifications = new Set<string>([
            ...productDocumentClassifications,
            ...defaultDocumentClassifications.map((classification) => classification.name),
        ]);

        return Array.from(allClassifications);
    }

    /**
     * @description Get auto declination history
     * @param {string} appID
     * @param {ApplicationStatusNameEnum} statusName
     * @param {ProductDynamoModel} product
     * @returns {Promise<AutoDeclinationHistoryDto[]>}
     */
    private async getAutoDeclinationHistory(
        appID: string,
        statusName: ApplicationStatusNameEnum,
        product: ProductDynamoModel,
    ): Promise<AutoDeclinationHistoryDto[]> {
        const declinedStatus = [ApplicationStatusNameEnum.DECLINED, ApplicationStatusNameEnum.UNDERWRITING_DECLINED];
        const isDeclined = declinedStatus.includes(statusName);

        if (!isDeclined) return [];

        const declinationRecord = await this.autoDeclinationHistoryEntity.findOneByAppID(appID);

        if (!declinationRecord) return [];

        // Create a lookup map for product questions for efficient section lookup
        const questionSectionMap = new Map<string, string>();

        product.questions.forEach((question) => {
            questionSectionMap.set(question.source_key, question.section_group);
        });

        return declinationRecord.history.map(({ failureDetails, timestamp }) => ({
            timestamp,
            rules: failureDetails.map(({ rule }) => {
                const section =
                    rule.type === AutoDeclineConditionTypeEnum.APPLICATION_ANSWER
                        ? questionSectionMap.get(rule.sourceKey) || ''
                        : '';

                return {
                    displayLabel: rule.displayLabel || '',
                    type: rule.type,
                    sourceKey: rule.sourceKey,
                    section,
                };
            }),
        }));
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
