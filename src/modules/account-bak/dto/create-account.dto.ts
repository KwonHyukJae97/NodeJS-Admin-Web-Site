import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Account3 } from '../entities/account.entity';
import { OmitType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateAccountDto extends OmitType(Account3, [
  'accountId',
  'regDate',
  'roleId',
  'role',
  'ability',
]) {
  public toAccountEntity() {
    return Account3.from(this.email, this.password, this.nickname, this.name, this.hp);
  }
}
