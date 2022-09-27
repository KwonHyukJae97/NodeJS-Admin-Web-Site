import { OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/user';

export class CreateUserDto extends OmitType(User, ['user_id', 'account_id']) {
  public toUserEntity() {
    return User.from(this.grade);
  }
}
