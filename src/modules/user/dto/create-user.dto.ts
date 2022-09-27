import { OmitType } from '@nestjs/mapped-types';
import { Account } from '../../account-bak/entities/account.entity';
import { User } from '../entities/user';

export class CreateUserDto extends OmitType(User, ['user_id']) {
  public toUserEntity() {
    return User.from(this.accountId, this.state);
  }
}
