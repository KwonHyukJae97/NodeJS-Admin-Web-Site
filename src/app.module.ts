import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from "./modules/user/user.module";
import {AccountModule} from "./modules/account/account.module";
import * as dotenv from "dotenv";

dotenv.config({
    path: ((process.env.NODE_ENV === 'local') ? '.local.env' : '.production.env')
});

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      entities: ["__DIR/**/*.entity{.ts,.js}"],
      synchronize: true,
      autoLoadEntities: true,
  }), UserModule, AccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
