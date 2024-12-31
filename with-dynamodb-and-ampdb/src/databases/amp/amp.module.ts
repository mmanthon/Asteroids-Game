import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectKnex, Knex, KnexModule } from 'nestjs-knex';

import { AmpTemplateQueries } from './queries';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';

@Global()
@Module({
    imports: [
        KnexModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                config: { ...config.get<object>('amp') },
            }),
        }),
        DynamoDBModule,
    ],
    providers: [AmpTemplateQueries],
    exports: [AmpTemplateQueries],
})
export class AmpModule {
    private logger = new Logger(AmpModule.name);

    constructor(@InjectKnex() private readonly amp: Knex) {
        this.logDatabaseConnection();
    }

    private async logDatabaseConnection() {
        try {
            await this.amp.client.raw('SELECT 1');
            this.logger.log('Database connection successful');
        } catch (err) {
            if (process.env.NODE_ENV !== 'test') {
                this.logger.error(`Database connection failed: ${err.message}`);
                process.exit(1);
            }
        }
    }
}
