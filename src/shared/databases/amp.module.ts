import {
    AclRoleEntity,
    AgencyEntity,
    CompanyEntity,
    EmailTrackingEntity,
    ItemEntity,
    PersonEntity,
    SessionEntity,
    UserEntity,
    createEntityProviders,
    mysqlEntityFactory,
} from '@ignidus/iscx-backend-utils';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'Amp',
            useFactory: (configService: ConfigService): Knex => {
                const knexInstance = knex(configService.get<object>('amp'));
                const logger = new Logger(AmpModule.name);

                // Validate connection on initialization
                knexInstance
                    .raw('SELECT 1')
                    .then(() => logger.log('Amp database connection successful'))
                    .catch((error) => {
                        logger.error('Amp database connection failed', error.message);
                        process.exit(1);
                    });

                return knexInstance;
            },
            inject: [ConfigService],
        },
        {
            provide: 'TrackingDB',
            useFactory: (configService: ConfigService): Knex => {
                const knexInstance = knex(configService.get<object>('trackingDB'));
                const logger = new Logger(AmpModule.name);

                // Validate connection on initialization
                knexInstance
                    .raw('SELECT 1')
                    .then(() => logger.log('Tracking database connection successful'))
                    .catch((error) => {
                        logger.error('Tracking database connection failed', error.message);
                        process.exit(1);
                    });

                return knexInstance;
            },
            inject: [ConfigService],
        },
        ...createEntityProviders(
            ['Amp'],
            [
                { entityClass: AclRoleEntity },
                { entityClass: AgencyEntity },
                { entityClass: CompanyEntity },
                { entityClass: ItemEntity },
                { entityClass: PersonEntity },
                { entityClass: UserEntity },
                { entityClass: EmailTrackingEntity },
                { entityClass: SessionEntity },
            ],
            mysqlEntityFactory,
        ),
    ],
    exports: [
        'Amp',
        'TrackingDB',
        AgencyEntity,
        AclRoleEntity,
        CompanyEntity,
        ItemEntity,
        PersonEntity,
        UserEntity,
        EmailTrackingEntity,
        SessionEntity,
    ],
})
export class AmpModule {}
