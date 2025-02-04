/* eslint-disable camelcase */
import {
    AclRoleEntity,
    AgencyEntity,
    CompanyEntity,
    DynamoUserEntity,
    PersonEntity,
    UserEntity,
} from '@ignidus/iscx-backend-utils';
import { Injectable } from '@nestjs/common';

import { UserInfoDto } from './dto';

@Injectable()
export class AuthUtil {
    constructor(
        private readonly userEntity: UserEntity,
        private readonly agencyEntity: AgencyEntity,
        private readonly companyEntity: CompanyEntity,
        private readonly personEntity: PersonEntity,
        private readonly aclRoleEntity: AclRoleEntity,
        private readonly dynamoUserEntity: DynamoUserEntity,
    ) {}

    /**
     * @description Gets the user info for the session id
     * @param {string} sessionID
     */
    async getUserInfo(sessionID: string): Promise<UserInfoDto> {
        const user = await this.userEntity.getUserBySessionID(sessionID);
        const [ampRoles, iscxUser, agency] = await Promise.all([
            this.aclRoleEntity.getRolesForUser(user.user_id),
            this.dynamoUserEntity.findOneByIdentifier(String(user.user_id)),
            this.agencyEntity.getAgencyByID(user.agency_id),
        ]);
        const agencyName = (await this.companyEntity.getCompanyByID(agency.company_id)).name;
        let parentAgencyCompanyName = agencyName;
        let parentAgencyID = String(user.agency_id);
        let phoneNumber = '';

        // if the user has a person id, get the phone number from the person table
        if (user.person_id) {
            const { phone } = await this.personEntity.getPersonByID(user.person_id);

            if (phone && phone !== '') phoneNumber = phone.replace(/\D/g, '');
        }
        if (user.parent_agency_id) {
            const { agency_id, company_id } = await this.agencyEntity.getAgencyByID(user.parent_agency_id);

            parentAgencyID = String(agency_id);
            parentAgencyCompanyName = (await this.companyEntity.getCompanyByID(company_id)).name;
        }

        return {
            id: String(user.user_id),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: phoneNumber,
            parentAgencyCompanyName,
            parentAgencyID,
            agencyID: String(user.agency_id),
            agencyName,
            roles: [...ampRoles, ...(iscxUser?.roles || [])],
            groups: iscxUser?.groups || [],
        };
    }
}
