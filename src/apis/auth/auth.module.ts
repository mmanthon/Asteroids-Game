import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUtil } from './auth.util';

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthUtil],
})
export class AuthModule {}
