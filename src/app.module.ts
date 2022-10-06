import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account-bak/account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggingModule } from './logging/logging.module';
import { NoticeModule } from './modules/board/notice/notice.module';
import { FileModule } from './modules/board/file/file.module';
import { QnaModule } from './modules/board/qna/qna.module';
import { CommentModule } from './modules/board/comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: `.${process.env.NODE_ENV}.env`,
      envFilePath: '.local.env',
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_CHANGE_TIME: Joi.string().required(),

        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_DB: Joi.string().required(),
        DATABASE_DB_SYNCHRONIZE: Joi.string().required(),

        isGlobal: true,
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      // synchronize: Boolean(process.env.DATABASE_DB_SYNCHRONIZE),
      autoLoadEntities: true,
      // entities: ["__DIR/**/*.entity{.ts,.js}"],
      timezone: 'UTC',
    }),
    WinstonModule.forRoot({
      defaultMeta: {},
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV !== 'production' ? 'silly' : 'info',
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('TenPick Service BackEnd', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    UserModule,
    AccountModule,
    AuthModule,
    LoggingModule,
    NoticeModule,
    FileModule,
    QnaModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
