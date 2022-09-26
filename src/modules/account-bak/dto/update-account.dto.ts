import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { Account } from '../entities/account.entity';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  public toUpdateAccountEntity() {
    return Account.from(this.email, this.password, this.nickname, this.name, this.hp);
  }
}
