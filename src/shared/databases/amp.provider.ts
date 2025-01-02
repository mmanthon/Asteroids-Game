import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

@Injectable()
export class AmpProvider implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AmpProvider.name);
    private knexInstance: Knex;

    constructor(private readonly configService: ConfigService) {
        this.knexInstance = knex(this.configService.get<object>('amp'));
    }

    get connection(): Knex {
        return this.knexInstance;
    }

    async onModuleInit() {
        try {
            await this.knexInstance.raw('SELECT 1');
            this.logger.log('Amp database connection successful');
        } catch (error) {
            this.logger.error('Amp database connection failed', error.message);
            process.exit(1);
        }
    }

    async onModuleDestroy() {
        try {
            await this.knexInstance.destroy();
            this.logger.log('Amp database connection closed');
        } catch (error) {
            this.logger.error('Error closing Amp connection', error.message);
        }
    }
}
