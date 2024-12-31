import { Server } from 'http';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Context, Handler } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import * as express from 'express';

import { AppModule } from './app.module';
import { ApplicationSetup } from './appSetup';

const binaryMimeTypes: string[] = [];
let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
    if (!cachedServer) {
        const expressApp = express();
        const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

        await new ApplicationSetup(app).lambda();
        cachedServer = createServer(expressApp, undefined, binaryMimeTypes);
    }

    return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
    cachedServer = await bootstrapServer();

    return proxy(cachedServer, event, context, 'PROMISE').promise;
};
