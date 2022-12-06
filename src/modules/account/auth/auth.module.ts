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
import { PassportModule } from '@nestjs/passport';
import { SignInAdminHandler } from './command/signin-admin.handler';
import { SignInUserHandler } from './command/signin-user.handler';
import { AccountFileDb } from '../account-file-db';
import { AccountFile } from '../../file/entities/account-file';
import { ConvertException } from '../../../common/utils/convert-exception';
import { JwtStrategy } from 'src/guard/jwt/jwt.strategy';
import { LocalStrategy } from 'src/guard/local/local.strategy';
import { Company } from 'src/modules/company/entities/company.entity';
import { KakaoSignUpAdminHandler } from './command/kakao-signup-admin.handler';
import { AuthService } from './auth.service';
import { NaverSignUpAdminHandler } from './command/naver-signup-admin.handler';
import { GoogleSignUpAdminHandler } from './command/google-signup-admin.handler';
import { JwtRefreshStrategy } from 'src/guard/jwt/jwt-refresh.strategy';
import { GetAuthInfoQueryHandler } from './query/get-auth-info-handler';
import { AdminUpdateInfoHandler } from '../admin/command/admin-update-info-handler';
import { EmailService } from 'src/modules/email/email.service';
import { AdminUpdatePasswordHandler } from './command/admin-update-password.handler';
import { GetFindIdQueryHandler } from './query/get-findId.handler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Admin, Account, AccountFile, Company]),
    CqrsModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
        },
      }),
    }),
  ],
  controllers: [SignController],
  providers: [
    KakaoSignUpAdminHandler,
    NaverSignUpAdminHandler,
    GoogleSignUpAdminHandler,
    SignUpUserHandler,
    GetFindIdQueryHandler,
    GetAuthInfoQueryHandler,
    AdminUpdateInfoHandler,
    SignUpAdminHandler,
    SignInAdminHandler,
    SignInUserHandler,
    AdminUpdatePasswordHandler,
    AuthService,
    EmailService,
    ConvertException,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    { provide: 'accountFile', useClass: AccountFileDb },
  ],
})
export class AuthModule {}
