import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { Account3 } from '../entities/account.entity';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  public toUpdateAccountEntity() {
    return Account3.from(this.email, this.password, this.nickname, this.name, this.hp);
  }
}
