import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccountModule } from '../account-bak/account.module';
import { LocalStrategy } from '../../guard/local/local.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../guard/jwt/jwt.strategy';
import { AccountService } from '../account-bak/account.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../guard/role/roles.guard';
import { JwtRefreshStrategy } from '../../guard/jwt/jwt-refresh.strategy';
import { JwtManageService } from '../../guard/jwt/jwt-manage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from '../account/user/entities/user';
import { Admin } from '../account/admin/entities/admin';
import { Account2 } from '../account/entities/account';
import { AuthService2 } from '../account/auth/auth2.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule, TypeOrmModule.forFeature([User, Admin, Account2]), CqrsModule],
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
    AuthService2,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
