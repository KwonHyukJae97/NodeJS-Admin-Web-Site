import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserCommand } from './update-user.command';
import { User } from '../entities/user';
import { Account } from '../../entities/account';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

/**
 * 앱 사용자 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { password, email, phone, nickname, grade, userId } = command;

    const user = await this.userRepository.findOneBy({ userId: userId });
    const account = await this.accountRepository.findOneBy({ accountId: userId });

    user.grade = grade;
    await this.userRepository.save(user);

    // 비밀번호 암호화 저장 (bcrypt)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    account.password = hashedPassword;
    account.email = email;
    account.phone = phone;
    account.nickname = nickname;
    await this.accountRepository.save(account);

    //수정된 내용 반환
    return account;
  }
}
