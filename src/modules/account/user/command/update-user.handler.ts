import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { User } from '../entities/user';
import { UpdateUserCommand } from './update-user.command';

/**
 * 앱 사용자 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { password, email, phone, nickname, grade, userId } = command;

    const user = await this.userRepository.findOneBy({ userId: userId });
    const accountId = user.accountId.accountId;
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    //학년정보 수정
    try {
      user.grade = grade;
      await this.userRepository.save(user);
    } catch (err) {
      console.log(err);
      //저장 실패 에러 메시지 반환
      return this.convertException.throwError('badInput', '학년정보에', 400);
    }

    // 비밀번호 암호화 저장 (bcrypt)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    //계정 정보 수정
    try {
      account.password = hashedPassword;
      account.email = email;
      account.phone = phone;
      account.nickname = nickname;
      await this.accountRepository.save(account);
    } catch (err) {
      console.log(err);
      //저장 실패 에러 메시지 반환
      return this.convertException.throwError('badInput', '', 500);
    }

    //수정된 내용 반환
    return account;
  }
}
