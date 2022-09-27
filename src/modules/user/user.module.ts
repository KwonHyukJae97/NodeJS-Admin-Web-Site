import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user';
import { Account } from './entities/account';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Account])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
