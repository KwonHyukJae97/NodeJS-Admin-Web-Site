import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../entities/account.entity';
import { OmitType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateAccountDto extends OmitType(Account, [
  'accountId',
  'regDate',
  'roleId',
  'role',
  'ability',
]) {
  public toAccountEntity() {
    return Account.from(this.email, this.password, this.nickname, this.name, this.hp);
  }
}
