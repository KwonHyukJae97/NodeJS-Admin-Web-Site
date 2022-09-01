import { Module } from '@nestjs/common';
import {PassportModule} from "@nestjs/passport";
import { AuthService } from './auth.service';
import {AccountModule} from "../modules/account/account.module";
import {LocalStrategy} from "../guard/local/local.strategy";
import { AuthController } from './auth.controller';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule, JwtService} from '@nestjs/jwt';
import {JwtStrategy} from "../guard/jwt/jwt.strategy";
import {AccountService} from "../modules/account/account.service";
import {APP_GUARD} from "@nestjs/core";
import {RolesGuard} from "../guard/role/roles.guard";
import {JwtRefreshStrategy} from "../guard/jwt/jwt-refresh.strategy";

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                // secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
                // expiresIn: `${configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
            })
        }),
        PassportModule,
        ConfigModule,
        AccountModule,
    ],
    providers: [
        AccountService,
        AuthService,
        ConfigService,
        JwtStrategy,
        JwtRefreshStrategy,
        LocalStrategy,
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    controllers: [AuthController],
})
export class AuthModule {}
