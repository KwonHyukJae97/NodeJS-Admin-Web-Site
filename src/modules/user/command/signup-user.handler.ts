import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../account/entities/account';
import { User } from '../entities/user';
import { SignUpUserCommand } from './signup-user.command';

/**
 * 앱 사용자 회원가입 핸들러(service)
 */
@Injectable()
@CommandHandler(SignUpUserCommand)
export class SignUpUserHandler implements ICommandHandler<SignUpUserCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async execute(command: SignUpUserCommand) {
    const { id, password, name, email, phone, nickname, birth, gender, grade } = command;

    const account = this.accountRepository.create({
      id,
      password,
      email,
      name,
      phone,
      nickname,
      birth,
      gender,
    });

    //회원가입시 아이디 중복확인
    const loginId = await this.accountRepository.findOne({ where: { id } });

    if (loginId) {
      console.log('회원가입 실패 테스트', 401);
      throw new HttpException('이미 존재하는 아이디입니다.', 401);
    }

    await this.accountRepository.save(account);

    const user = this.userRepository.create({
      accountId: account,
      grade,
    });

    await this.userRepository.save(user);
    console.log('앱 사용자 가입 테스트 로그', user);
    console.log('앱 사용자 가입 테스트 로그2', account);
    return '회원가입 완료 (사용자)';
  }
}
