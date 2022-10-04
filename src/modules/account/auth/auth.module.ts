import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignController } from './auth.controller';
import { SignUpUserHandler } from './command/signup-user.handler';
import { SignUpAdminHandler } from './command/signup-admin.handler';
import { Admin } from '../admin/entities/admin';
import { User } from '../user/entities/user';
import { Account2 } from '../entities/account';
import { JwtModule } from '@nestjs/jwt';
import { AuthService2 } from './auth2.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Admin, Account2]),
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
  providers: [SignUpUserHandler, SignUpAdminHandler, AuthService2],
})
export class SecondAuthModule {}
