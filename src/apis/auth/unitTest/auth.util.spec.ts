/* eslint-disable camelcase */
import {
    AclRoleEntity,
    AgencyEntity,
    CompanyEntity,
    DynamoUserEntity,
    PersonEntity,
    UserEntity,
} from '@ignidus/iscx-backend-utils';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthUtil } from '../auth.util';
import {
    agencyModelMock,
    agencyName,
    companyModelMock,
    parentAgencyCompanyName,
    parentAgencyID,
    personModelMock,
    sessionID,
    userDynamoModelMock,
    userInfoDtoMock,
    userModelMock,
    userRoles,
} from '../mocks';

describe('AuthUtil', () => {
    let authUtil: AuthUtil;
    let userEntity: UserEntity;
    let agencyEntity: AgencyEntity;
    let companyEntity: CompanyEntity;
    let dynamoUserEntity: DynamoUserEntity;
    let personEntity: PersonEntity;
    let aclRoleEntity: AclRoleEntity;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthUtil,
                {
                    provide: UserEntity,
                    useValue: {
                        getUserBySessionID: jest.fn(),
                    },
                },
                {
                    provide: AgencyEntity,
                    useValue: {
                        getAgencyByID: jest.fn(),
                    },
                },
                {
                    provide: CompanyEntity,
                    useValue: {
                        getCompanyByID: jest.fn(),
                    },
                },
                {
                    provide: PersonEntity,
                    useValue: {
                        getPersonByID: jest.fn(),
                    },
                },
                {
                    provide: AclRoleEntity,
                    useValue: {
                        getRolesForUser: jest.fn(),
                    },
                },
                {
                    provide: DynamoUserEntity,
                    useValue: {
                        findOneByIdentifier: jest.fn(),
                    },
                },
            ],
        }).compile();

        authUtil = module.get<AuthUtil>(AuthUtil);
        userEntity = module.get<UserEntity>(UserEntity);
        agencyEntity = module.get<AgencyEntity>(AgencyEntity);
        companyEntity = module.get<CompanyEntity>(CompanyEntity);
        dynamoUserEntity = module.get<DynamoUserEntity>(DynamoUserEntity);
        personEntity = module.get<PersonEntity>(PersonEntity);
        aclRoleEntity = module.get<AclRoleEntity>(AclRoleEntity);
    });

    afterEach(() => jest.clearAllMocks());

    describe('getUserInfo', () => {
        it('should return a user info DTO with valid user data', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue({
                ...userModelMock,
                parent_agency_id: null,
            });
            jest.spyOn(aclRoleEntity, 'getRolesForUser').mockResolvedValue(userRoles);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue(undefined);
            jest.spyOn(agencyEntity, 'getAgencyByID').mockResolvedValue(agencyModelMock);
            jest.spyOn(companyEntity, 'getCompanyByID').mockResolvedValue(companyModelMock);
            jest.spyOn(personEntity, 'getPersonByID').mockResolvedValue(personModelMock);

            const result = await authUtil.getUserInfo(sessionID);

            expect(result).toEqual({ ...userInfoDtoMock, parentAgencyCompanyName: agencyName });
            expect(userEntity.getUserBySessionID).toHaveBeenCalledTimes(1);
            expect(userEntity.getUserBySessionID).toHaveBeenCalledWith(sessionID);
            expect(aclRoleEntity.getRolesForUser).toHaveBeenCalledTimes(1);
            expect(aclRoleEntity.getRolesForUser).toHaveBeenCalledWith(userModelMock.user_id);
            expect(dynamoUserEntity.findOneByIdentifier).toHaveBeenCalledTimes(1);
            expect(dynamoUserEntity.findOneByIdentifier).toHaveBeenCalledWith(String(userModelMock.user_id));
            expect(agencyEntity.getAgencyByID).toHaveBeenCalledTimes(1);
            expect(agencyEntity.getAgencyByID).toHaveBeenCalledWith(userModelMock.agency_id);
            expect(companyEntity.getCompanyByID).toHaveBeenCalledTimes(1);
            expect(companyEntity.getCompanyByID).toHaveBeenCalledWith(agencyModelMock.company_id);
        });

        it('should return user info DTO with parent agency details if user has parent agency', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(userModelMock);
            jest.spyOn(aclRoleEntity, 'getRolesForUser').mockResolvedValue(userRoles);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue(undefined);
            jest.spyOn(personEntity, 'getPersonByID').mockResolvedValue(personModelMock);
            jest.spyOn(agencyEntity, 'getAgencyByID')
                .mockResolvedValueOnce(agencyModelMock)
                .mockResolvedValueOnce({ ...agencyModelMock, agency_id: Number(parentAgencyID) });
            jest.spyOn(companyEntity, 'getCompanyByID')
                .mockResolvedValueOnce(companyModelMock)
                .mockResolvedValueOnce({ ...companyModelMock, name: parentAgencyCompanyName });

            const result = await authUtil.getUserInfo(sessionID);

            expect(result).toEqual({
                ...userInfoDtoMock,
                parentAgencyCompanyName,
                parentAgencyID,
            });

            expect(userEntity.getUserBySessionID).toHaveBeenCalledTimes(1);
            expect(userEntity.getUserBySessionID).toHaveBeenCalledWith(sessionID);
            expect(aclRoleEntity.getRolesForUser).toHaveBeenCalledTimes(1);
            expect(aclRoleEntity.getRolesForUser).toHaveBeenCalledWith(userModelMock.user_id);
            expect(dynamoUserEntity.findOneByIdentifier).toHaveBeenCalledTimes(1);
            expect(dynamoUserEntity.findOneByIdentifier).toHaveBeenCalledWith(String(userModelMock.user_id));
            expect(agencyEntity.getAgencyByID).toHaveBeenCalledTimes(2);
            expect(agencyEntity.getAgencyByID).toHaveBeenCalledWith(userModelMock.agency_id);
            expect(agencyEntity.getAgencyByID).toHaveBeenCalledWith(userModelMock.parent_agency_id);
            expect(companyEntity.getCompanyByID).toHaveBeenCalledTimes(2);
        });

        it('should combine AMP roles and ISCx roles when both exist', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(userModelMock);
            jest.spyOn(aclRoleEntity, 'getRolesForUser').mockResolvedValue(userRoles);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue({
                ...userDynamoModelMock,
                roles: ['Admin', 'SuperUser'],
            });

            const result = await authUtil.getUserInfo(sessionID);

            expect(result.roles).toEqual([...userRoles, 'Admin', 'SuperUser']);
        });

        it('should return only AMP roles when ISCx roles do not exist', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(userModelMock);
            jest.spyOn(aclRoleEntity, 'getRolesForUser').mockResolvedValue(userRoles);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue({
                ...userDynamoModelMock,
                roles: undefined,
            });

            const result = await authUtil.getUserInfo(sessionID);

            expect(result.roles).toEqual(userRoles);
        });

        it('should return only ISCx roles when AMP roles do not exist', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(userModelMock);
            jest.spyOn(aclRoleEntity, 'getRolesForUser').mockResolvedValue([]);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue({
                ...userDynamoModelMock,
                roles: ['Admin'],
            });

            const result = await authUtil.getUserInfo(sessionID);

            expect(result.roles).toEqual(['Admin']);
        });

        it('should return ISCx groups when they exist', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(userModelMock);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue({
                ...userDynamoModelMock,
                groups: ['GroupA', 'GroupB'],
            });

            const result = await authUtil.getUserInfo(sessionID);

            expect(result.groups).toEqual(['GroupA', 'GroupB']);
        });

        it('should return an empty array when ISCx groups do not exist', async () => {
            jest.spyOn(userEntity, 'getUserBySessionID').mockResolvedValue(userModelMock);
            jest.spyOn(dynamoUserEntity, 'findOneByIdentifier').mockResolvedValue({
                ...userDynamoModelMock,
                groups: undefined,
            });

            const result = await authUtil.getUserInfo(sessionID);

            expect(result.groups).toEqual([]);
        });
    });
});
