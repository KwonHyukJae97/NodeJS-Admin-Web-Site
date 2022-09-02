import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({
      user_id: id,
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = updateUserDto.toUpdateUserEntity();
    return this.userRepository.update(id, user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
