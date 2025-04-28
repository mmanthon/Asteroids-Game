/* eslint-disable camelcase */
/* eslint-disable dot-notation */
import {
    AclRoleEntity,
    AmpRolesEnum,
    ApplicationTypeEnum,
    DynamoApplicationEntity,
    DynamoNoteEntity,
    EmailTrackingEntity,
    EmailTrackingModel,
    NoteAuthorRoleEnum,
    UserEntity,
} from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { ApplicationUtil } from '../application.util';
import { NoteTypeEnum } from '../enums';
import { AmpApplication, GetAmpNotesByAppIDResult } from '../interfaces';
import {
    appID,
    assignedUserID,
    boundDate,
    contentNote,
    createdDate,
    dateToFormat,
    emailTrackingID,
    emptyInsuredDto,
    formattedCreatedDate,
    formattedDate,
    mockAdditionalProductData,
    mockAgentDto,
    mockAmpApplication,
    mockAmpApplicationWithMissingFields,
    mockApplicationDto,
    mockApplicationDynamoModel,
    mockEmailDto,
    mockEmailTrackingModel,
    mockGetAmpNotesByIDResult,
    mockGetAmpNotesProducer,
    mockGetAmpNotesWithZeroUser,
    mockLinkedProducts,
    mockNoteDto,
    mockNoteDynamoModelMissingAuthor,
    mockProductDto,
    mockSimplifiedApplicationDto,
    mockUser,
    nextYearDate,
    policyNumber,
    programTypeID,
    userEmail,
    userFirstName,
    userID,
    userIDs,
    userLastName,
} from '../mocks';
import { mockEmptyUserModel, mockUserModel } from '../mocks/userModel.dto.mock';

describe('ApplicationUtil', () => {
    let util: ApplicationUtil;
    let applicationQuery: ApplicationQuery;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationUtil,
                {
                    provide: ApplicationQuery,
                    useValue: {
                        getAgentInfoByUserId: jest.fn().mockResolvedValue(mockAgentDto),
                        getTaskUserIDsByAppID: jest.fn().mockResolvedValue([{ assigned_to: assignedUserID }]),
                        getApplicationProducts: jest.fn().mockResolvedValue(mockProductDto),
                        getLinkedProductsByAppID: jest.fn().mockResolvedValue(mockLinkedProducts),
                        getEmailsByAppID: jest.fn().mockResolvedValue([mockEmailDto]),
                        getAmpNotesByAppID: jest.fn().mockResolvedValue([mockGetAmpNotesByIDResult]),
                        getAdditionalProductDataByAppID: jest.fn(),
                        findPolicyByAppID: jest.fn(),
                        unassignAllUnderwritersFromApplication: jest.fn(),
                        assignUnderwritersToApplication: jest.fn(),
                    },
                },
                { provide: 'Amp', useValue: {} },
                {
                    provide: UserEntity,
                    useValue: { getUserByID: jest.fn().mockResolvedValue(mockUserModel) },
                },
                { provide: DynamoApplicationEntity, useValue: { findOne: jest.fn() } },
                {
                    provide: AclRoleEntity,
                    useValue: { getRolesForUser: jest.fn() },
                },
                { provide: DynamoNoteEntity, useValue: { findAllByEntity: jest.fn() } },
                { provide: EmailTrackingEntity, useValue: { getByEntityID: jest.fn() } },
            ],
        }).compile();

        util = module.get(ApplicationUtil);
        applicationQuery = module.get(ApplicationQuery);
    });

    describe('getBaseFormattedApplicationData', () => {
        it('should set submissionID to empty string when group:id is undefined', async () => {
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const result = await util.getBaseFormattedApplicationData({
                ...mockAmpApplication,
                group_id: undefined,
            });

            expect(result.submissionID).toBe('');
        });

        it('should generate base formatted application data correctly', async () => {
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const result = await util.getBaseFormattedApplicationData(mockAmpApplication);

            expect(result).toEqual(mockSimplifiedApplicationDto);
        });

        it('should include only the base product if no linked products are found', async () => {
            jest.spyOn(applicationQuery, 'getLinkedProductsByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const result = await util.getBaseFormattedApplicationData({ ...mockAmpApplication, item_id: 101 });

            expect(result.products.length).toBe(1);
            expect(result.products[0].id).toBe(String(mockAmpApplication.product_ids));
        });

        it('should format assignedUsers by excluding invalid users and handle no users', async () => {
            jest.spyOn(applicationQuery, 'getTaskUserIDsByAppID')
                .mockResolvedValueOnce([{ assigned_to: assignedUserID }, { assigned_to: 'invalid-id' }])
                .mockResolvedValueOnce([]);
            jest.spyOn(util['userEntity'], 'getUserByID')
                .mockResolvedValueOnce(mockUserModel)
                .mockResolvedValueOnce(null);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const resultWithInvalid = await util.getBaseFormattedApplicationData({
                ...mockAmpApplication,
                item_id: 999,
            });

            expect(resultWithInvalid.assignedUsers).toEqual([
                {
                    id: String(mockUserModel.user_id),
                    firstName: mockUserModel.first_name,
                    lastName: mockUserModel.last_name,
                },
            ]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const resultNoUsers = await util.getBaseFormattedApplicationData({ ...mockAmpApplication, item_id: 123 });

            expect(resultNoUsers.assignedUsers).toEqual([]);
        });

        it.each([
            { field: 'effective_date', outputProp: 'effectiveDate' },
            { field: 'last_status_update', outputProp: 'lastStatusUpdate' },
        ])('should set $outputProp to empty string if $field is missing', async ({ field, outputProp }) => {
            const appInput = { ...mockAmpApplication, [field]: null };

            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const result = await util.getBaseFormattedApplicationData(appInput);

            expect(result[outputProp as keyof typeof result]).toBe('');
        });

        it.each([
            { created_from_renewal: 0, expectedType: ApplicationTypeEnum.NEW },
            { created_from_renewal: 1, expectedType: ApplicationTypeEnum.RENEWAL },
        ])(
            'should set type as $expectedType when created_from_renewal is $created_from_renewal',
            async ({ created_from_renewal, expectedType }) => {
                jest.spyOn(applicationQuery, 'getLinkedProductsByAppID').mockResolvedValueOnce([]);
                jest.spyOn(applicationQuery, 'getTaskUserIDsByAppID').mockResolvedValueOnce([]);
                jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

                const result = await util.getBaseFormattedApplicationData({
                    ...mockAmpApplication,
                    created_from_renewal,
                });

                expect(result.type).toBe(expectedType);
            },
        );

        it('should default agencyName and all insured fields to empty strings if they are undefined', async () => {
            jest.spyOn(applicationQuery, 'getLinkedProductsByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'getTaskUserIDsByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);

            const result = await util.getBaseFormattedApplicationData(mockAmpApplicationWithMissingFields);

            expect(result.agencyName).toBe('');
            expect(result.insured).toEqual(emptyInsuredDto);
        });
    });

    describe('handleUnderwriterAssignment', () => {
        it.each([
            { userIds: [], expectedMethod: 'unassignAllUnderwritersFromApplication' },
            { userIds: userIDs, expectedMethod: 'assignUnderwritersToApplication' },
        ])(
            'should handle underwriter assignment correctly when userIDs = $userIds',
            async ({ userIds, expectedMethod }) => {
                const spy = jest
                    .spyOn(applicationQuery, expectedMethod as keyof ApplicationQuery)
                    .mockResolvedValue(undefined);

                await util.handleUnderwriterAssignment(appID, userIds);
                if (userIds.length === 0) {
                    expect(spy).toHaveBeenCalledWith(appID);
                } else {
                    expect(spy).toHaveBeenCalledWith(appID, userIds);
                }
            },
        );
    });

    describe('formatApplication', () => {
        it('should fallback to "Lance" as creatorFirstName when note.first_name is missing', async () => {
            const note: GetAmpNotesByAppIDResult = {
                ...mockGetAmpNotesByIDResult,
                first_name: undefined,
                entry_status: 'Active',
                sent_to_producer: 1,
                sent_to_underwriter: 1,
            };

            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([note]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValueOnce({ policy_number: policyNumber });
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result.notes[0].author.firstName).toBe('Lance');
        });
        it('should assign role, createdBy, parentNoteID, and isActive correctly for AMP notes', async () => {
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([mockGetAmpNotesProducer]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValueOnce({ policy_number: policyNumber });
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);
            const note = result.notes[0];

            expect(note.author.role).toBe(NoteAuthorRoleEnum.UNDERWRITER);
            expect(note.createdBy).toBe('John Doe');
            expect(note.parentNoteID).toBe('456');
            expect(note.isActive).toBe(true);
        });

        it('should assign role, createdBy, parentNoteID, and isActive correctly for AMP notes', async () => {
            const ampNote: GetAmpNotesByAppIDResult = {
                note_id: 999,
                written: formattedCreatedDate,
                entry_status: 'Active',
                user_id: 1,
                first_name: userFirstName,
                last_name: userLastName,
                note: contentNote,
                parent_note_id: 789,
                sent_to_producer: 1,
                sent_to_underwriter: 0,
                acl_role_id: 2,
            };

            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([ampNote]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValueOnce({ policy_number: policyNumber });
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);
            const note = result.notes[0];

            expect(note.author.role).toBe(NoteAuthorRoleEnum.PRODUCER);
        });

        it('should default subject and body to empty string if missing in email', async () => {
            const incompleteEmail: EmailTrackingModel = {
                email_tracking_id: emailTrackingID,
                from_address: userEmail,
                to_address: 'someone@example.com',
                subject: undefined,
                body_html: undefined,
                sent_at: mockEmailDto.sentAt,
            };

            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([incompleteEmail]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce(undefined);
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result.emails[0].subject).toBe('');
            expect(result.emails[0].body).toBe('');
        });

        it('should default recipients to empty array if to_address is missing', async () => {
            const incompleteEmail: EmailTrackingModel = {
                email_tracking_id: emailTrackingID,
                from_address: userEmail,
                to_address: undefined,
                subject: mockEmailDto.subject,
                body_html: mockEmailDto.body,
                sent_at: mockEmailDto.sentAt,
            };

            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([incompleteEmail]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce(undefined);
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result.emails[0].recipients).toStrictEqual([]);
        });

        it('should format a non-marketplace application correctly with base data', async () => {
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([
                mockAdditionalProductData,
            ]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue(mockEmailTrackingModel);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result).toMatchObject(mockApplicationDto);
        });

        it('should handle missing email recipients and body gracefully', async () => {
            const email = {
                email_tracking_id: emailTrackingID,
                from_address: mockEmailDto.sender,
                to_address: undefined,
                subject: mockEmailDto.subject,
                body_html: '',
                sent_at: mockEmailDto.sentAt,
            };

            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([email]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result.emails[0].body).toBe('');
            expect(result.emails[0].recipients).toEqual([]);
            expect(result.policyNumber).toBe('');
        });

        it('should format a marketplace app and handle missing internal note authors', async () => {
            jest.spyOn(util['applicationEntity'], 'findOne').mockResolvedValue(mockApplicationDynamoModel);
            jest.spyOn(util['noteEntity'], 'findAllByEntity')
                .mockResolvedValueOnce([mockNoteDynamoModelMissingAuthor])
                .mockResolvedValueOnce([]);
            jest.spyOn(util['userEntity'], 'getUserByID').mockImplementation(async () => mockEmptyUserModel);
            jest.spyOn(util['aclRoleEntity'], 'getRolesForUser').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue([]);
            const result = await util.formatApplication({ ...mockAmpApplication, program_type_id: 22 }, mockUser);

            expect(result.notes[0].createdBy).toBe('System User');
        });

        it('should sanitize amp note content and mark as SYSTEM_ONLY if user_id = 0', async () => {
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([mockGetAmpNotesWithZeroUser]);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValueOnce({ policy_number: policyNumber });
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result.notes[0].content).toBe('');
            expect(result.notes[0].type).toBe(NoteTypeEnum.SYSTEM_ONLY);
        });

        it('should return empty values for marketplace app if not found', async () => {
            jest.spyOn(util['applicationEntity'], 'findOne').mockResolvedValue(null);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue(undefined);
            jest.spyOn(util['noteEntity'], 'findAllByEntity').mockResolvedValueOnce([]).mockResolvedValueOnce([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue([]);

            const result = await util.formatApplication({ ...mockAmpApplication, program_type_id: 22 }, mockUser);

            expect(result.effectiveDate).toBe('');
            expect(result.expirationDate).toBe('');
            expect(result.boundDate).toBe('');
            expect(result.policyNumber).toBe('');
        });

        it('should default policyNumber to empty string if policy is missing', async () => {
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue(undefined);
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([
                mockAdditionalProductData,
            ]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue([]);
            const result = await util.formatApplication(mockAmpApplication, mockUser);

            expect(result.policyNumber).toBe('');
        });

        it('should format a marketplace application correctly', async () => {
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([
                mockAdditionalProductData,
            ]);

            jest.spyOn(util['applicationEntity'], 'findOne').mockResolvedValueOnce(mockApplicationDynamoModel);
            const inactiveNote = {
                ...mockNoteDto,
                isActive: false,
                content: null,
                userID: String(userID),
            };

            jest.spyOn(util['noteEntity'], 'findAllByEntity')
                .mockResolvedValueOnce([inactiveNote])
                .mockResolvedValueOnce([]);
            jest.spyOn(util['userEntity'], 'getUserByID').mockResolvedValueOnce(mockUserModel);
            jest.spyOn(util['aclRoleEntity'], 'getRolesForUser').mockResolvedValueOnce([AmpRolesEnum.UNDERWRITER]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce(mockEmailTrackingModel);

            const result = await util.formatApplication({ ...mockAmpApplication, program_type_id: 22 }, mockUser);

            expect(result).toMatchObject({
                ...mockApplicationDto,
                isMarketplaceApp: true,
                emails: [],
                products: [
                    {
                        ...mockApplicationDto.products[0],
                        programTypeID: '22',
                    },
                    ...mockApplicationDto.products.slice(1),
                ],
                notes: [
                    {
                        ...result.notes[0],
                        content: '',
                    },
                ],
            });
        });

        it('should format a non-marketplace application with emails and notes correctly', async () => {
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([
                mockAdditionalProductData,
            ]);
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValue([mockGetAmpNotesByIDResult]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue(mockEmailTrackingModel);
            const result = await util.formatApplication(
                { ...mockAmpApplication, program_type_id: programTypeID },
                mockUser,
            );

            expect(result).toMatchObject({
                ...mockApplicationDto,
                createdDate: formattedCreatedDate,
                isMarketplaceApp: false,
            });
        });

        it('should format date fields as YYYY-MM-DD in the result', async () => {
            const testApp: AmpApplication = {
                ...mockAmpApplication,
                effective_date: dateToFormat,
                last_updated: dateToFormat,
                first_bound_date: dateToFormat,
                created: createdDate,
            };

            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([
                mockAdditionalProductData,
            ]);
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValue([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue([]);
            const result = await util.formatApplication(testApp, mockUser);

            expect(result.createdDate).toBe(formattedCreatedDate);
            expect(result.updatedDate).toBe(formattedDate);
            expect(result.boundDate).toBe(boundDate);
            expect(result.expirationDate).toBe(nextYearDate);
        });

        it('should handle missing product data gracefully (use default expiration logic)', async () => {
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue([]);
            const result = await util.formatApplication(
                {
                    ...mockAmpApplication,
                    effective_date: dateToFormat,
                },
                mockUser,
            );

            expect(result.expirationDate).toBe(nextYearDate);
        });

        it('should handle system notes (user_id = 0) correctly for active and inactive notes', async () => {
            const scenarios = [
                { entry_status: 'Inactive', note: 'Hidden note', isActive: false, expectedContent: 'Hidden note' },
                { entry_status: 'Active', note: null, isActive: true, expectedContent: '' },
            ];

            for (const { entry_status, note, isActive, expectedContent } of scenarios) {
                const ampNote: GetAmpNotesByAppIDResult = {
                    ...mockGetAmpNotesByIDResult,
                    entry_status,
                    user_id: 0,
                    note,
                };

                jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValueOnce([ampNote]);
                jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValueOnce([]);
                jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValueOnce({
                    policy_number: policyNumber,
                });
                jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValueOnce([]);
                const result = await util.formatApplication(mockAmpApplication, mockUser);
                const formattedNote = result.notes[0];

                expect(formattedNote.content).toBe(expectedContent);
                expect(formattedNote.isActive).toBe(isActive);
                expect(formattedNote.isInternal).toBe(false);
                expect(formattedNote.type).toBe(NoteTypeEnum.SYSTEM_ONLY);
                expect(formattedNote.author.firstName).toBe(mockNoteDto.author.firstName);
                expect(formattedNote.author.lastName).toBe(mockNoteDto.author.lastName);
            }
        });

        it('should set updatedDate and boundDate to empty string if not provided', async () => {
            jest.spyOn(applicationQuery, 'findPolicyByAppID').mockResolvedValue({ policy_number: policyNumber });
            jest.spyOn(applicationQuery, 'getAdditionalProductDataByAppID').mockResolvedValue([]);
            jest.spyOn(applicationQuery, 'getAmpNotesByAppID').mockResolvedValue([]);
            jest.spyOn(util['emailTrackingEntity'], 'getByEntityID').mockResolvedValue([]);
            jest.spyOn(util['noteEntity'], 'findAllByEntity').mockResolvedValue([]).mockResolvedValue([]);
            jest.spyOn(util['userEntity'], 'getUserByID').mockResolvedValue(mockUserModel);
            jest.spyOn(util['aclRoleEntity'], 'getRolesForUser').mockResolvedValue([AmpRolesEnum.UNDERWRITER]);

            const appWithoutDates: AmpApplication = {
                ...mockAmpApplication,
                last_updated: undefined,
                first_bound_date: undefined,
            };
            const result = await util.formatApplication(appWithoutDates, mockUser);

            expect(result.updatedDate).toBe('');
            expect(result.boundDate).toBe('');
        });
    });

    describe('formatDate', () => {
        it('should format a date string as YYYY-MM-DD', () => {
            const result = util['formatDate'](dateToFormat);

            expect(result).toBe(formattedDate);
        });
    });
});
