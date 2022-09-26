import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { User } from '../entities/user';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  public toUpdateUserEntity() {
    return User.from(this.account_id, this.grade);
  }
}
