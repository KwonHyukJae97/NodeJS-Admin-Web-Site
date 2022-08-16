import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from "./modules/user/user.module";
import {AccountModule} from "./modules/account/account.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as Joi from "joi";
import {AuthModule} from "./auth/auth.module";

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
      UserModule, AccountModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
