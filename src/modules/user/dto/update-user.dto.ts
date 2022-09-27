import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { User } from '../entities/user';
import { Account } from '../entities/account';

export class UpdateUserDto extends IntersectionType(CreateUserDto, PartialType(Account)) {
  public toUpdateUserEntity() {
    return Account.from(this.email, this.nickname, this.password, this.phone, this.grade);
  }
}
