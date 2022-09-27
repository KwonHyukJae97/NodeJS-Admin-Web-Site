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

  /**
   * 앱 사용자 리스트 조회
   */
  findAll() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .getMany();
  }

  /**
   * 앱 사용자 상세 정보 조회
   * @param account_id
   */
  findOne(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .where('account.account_id = :id', { id: id })
      .getOne();
  }

  /**
   * 앱 사용자 정보 수정
   * @param user
   */
  update(id: number, updateUserDto: UpdateUserDto) {
    const user = updateUserDto.toUpdateUserEntity();
    return this.userRepository.update(id, user);
  }

  /**
   * 앱 사용자 정보 삭제
   */
  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
