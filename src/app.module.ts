import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from "./modules/user/user.module";
import {AccountModule} from "./modules/account/account.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as Joi from "joi";
import {AuthModule} from "./auth/auth.module";
import {utilities, WinstonModule} from "nest-winston";
import * as winston from "winston";
import {error} from "winston";
import {LoggingModule} from "./logging/logging.module";

@Module({
  imports: [
      ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
          validationSchema: Joi.object({
              JWT_SECRET: Joi.string().required(),
              JWT_EXPIRATION_TIME: Joi.string().required(),
          })
      }),
      TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DATABASE_HOST,
          port: +process.env.DATABASE_PORT,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_DB,
          // entities: ["__DIR/**/*.entity{.ts,.js}"],
          // synchronize: true,
          autoLoadEntities: true,
      }),
      WinstonModule.forRoot({
          defaultMeta: {},
          transports: [
              new winston.transports.Console({
                  level: process.env.NODE_ENV !== 'production' ? 'silly' : 'info',
                  format: winston.format.combine(
                      winston.format.errors({stack: true}),
                      winston.format.json(),
                      winston.format.timestamp(),
                      winston.format.ms(),
                      utilities.format.nestLike('B2C App BackEnd', {
                          prettyPrint: true
                      })
                  ),
              })
          ]
      }),
      UserModule, AccountModule, AuthModule, LoggingModule
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
