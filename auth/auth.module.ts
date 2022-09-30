import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccountModule } from '../src/modules/account-bak/account.module';
import { LocalStrategy } from '../src/guard/local/local.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../src/guard/jwt/jwt.strategy';
import { AccountService } from '../src/modules/account-bak/account.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../src/guard/role/roles.guard';
import { JwtRefreshStrategy } from '../src/guard/jwt/jwt-refresh.strategy';
import { JwtManageService } from '../src/guard/jwt/jwt-manage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from '../src/modules/account/user/entities/user';
import { Admin } from '../src/modules/account/admin/entities/admin';
import { Account } from '../src/modules/account/entities/account';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule, TypeOrmModule.forFeature([User, Admin, Account]), CqrsModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({}),
    }),
    PassportModule,
    ConfigModule,
    AccountModule,
  ],
  providers: [
    AccountService,
    AuthService,
    ConfigService,
    JwtManageService,
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
