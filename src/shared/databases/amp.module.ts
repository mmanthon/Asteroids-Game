import { ItemEntity } from '@ignidus/iscx-backend-utils';
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
            provide: ItemEntity,
            useFactory: (ampKnex: Knex) => {
                return new ItemEntity(ampKnex);
            },
            inject: ['Amp'],
        },
    ],
    exports: ['Amp', ItemEntity],
})
export class AmpModule {}
