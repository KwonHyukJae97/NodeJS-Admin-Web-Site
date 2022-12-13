import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/modules/account/entities/account';
import { User } from 'src/modules/account/user/entities/user';
import { Repository } from 'typeorm';
import { SignUpUserCommand } from './signup-user.command';
import { ConvertException } from 'src/common/utils/convert-exception';
import * as bcrypt from 'bcryptjs';

/**
 * 사용자 회원가입 핸들러
 */
@Injectable()
@CommandHandler(SignUpUserCommand)
export class SignUpUserHandler implements ICommandHandler<SignUpUserCommand> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: SignUpUserCommand) {
    const { id, password, name, email, phone, nickname, birth, gender, grade } = command;

    /**
     * 비밀번호 암호화 저장 (bcrypt)
     */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const accountUser = this.accountRepository.create({
      id,
      password: hashedPassword,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
    });

    const isIdExist = await this.accountRepository.findOne({ where: { id } });
    const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });

    if (isIdExist) {
      return this.convertException.badInput('이미 존재하는 아이디입니다. ', 400);
    } else if (isEmailExist) {
      return this.convertException.badInput('이미 존재하는 이메일입니다. ', 400);
    } else if (isPhoneExist) {
      return this.convertException.badInput('이미 존재하는 연락처입니다. ', 400);
    } else if (isNicknameExist) {
      return this.convertException.badInput('이미 존재하는 닉네임입니다. ', 400);
    }
    {
      //Account 저장
      try {
        await this.accountRepository.save(accountUser);
      } catch (err) {
        console.log(err);
        return this.convertException.badRequestError('사용자 회원가입에 ', 400);
      }
    }

    const user = this.userRepository.create({
      accountId: accountUser.accountId,
      grade,
    });
    try {
      await this.userRepository.save(user);
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return '회원가입 완료 (사용자)';
  }
}
