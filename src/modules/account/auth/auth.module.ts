import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignController } from './auth.controller';
import { SignUpUserHandler } from './command/signup-user.handler';
import { SignUpAdminHandler } from './command/signup-admin.handler';
import { User } from '../user/entities/user';
import { Admin } from '../admin/entities/admin';
import { Account } from '../entities/account';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AccountService } from 'src/modules/account-bak/account.service';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import { Account3 } from 'src/modules/account-bak/entities/account.entity';
import { KakaoStrategy } from 'src/guard/jwt/kakao.strategy';
import { SignInAdminHandler } from './command/signin-admin.handler';
import { SignInUserHandler } from './command/signin-user.handler';
import { AccountFileDb } from '../account-file-db';
import { AccountFile } from '../../file/entities/account-file';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Admin, Account3, Account, AccountFile]),
    CqrsModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [SignController],
  providers: [
    SignUpUserHandler,
    SignUpAdminHandler,
    SignInAdminHandler,
    SignInUserHandler,
    AuthService,
    AccountService,
    JwtManageService,
    { provide: 'accountFile', useClass: AccountFileDb },
  ],
})
export class SecondAuthModule {}
