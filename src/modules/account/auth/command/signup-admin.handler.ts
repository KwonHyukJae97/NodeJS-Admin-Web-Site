import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/modules/account/admin/entities/admin';
import { Account } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';
import { SignUpAdminCommand } from './signup-admin.command';
import { ConvertException } from 'src/common/utils/convert-exception';
import * as bcrypt from 'bcryptjs';

/**
 * 관리자 회원가입 Handler
 */
@Injectable()
@CommandHandler(SignUpAdminCommand)
export class SignUpAdminHandler implements ICommandHandler<SignUpAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: SignUpAdminCommand) {
    const {
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
      division,
    } = command;

    /**
     * 비밀번호 암호화 저장 (bcrypt)
     */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const accountAdmin = this.accountRepository.create({
      id,
      password: hashedPassword,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      division,
    });

    //중복체크
    const isIdExist = await this.accountRepository.findOne({ where: { id } });
    const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });

    if (isIdExist) {
      throw new UnauthorizedException('이미 존재하는 아이디입니다.');
    } else if (isEmailExist) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    } else if (isPhoneExist) {
      throw new UnauthorizedException('이미 존재하는 연락처입니다.');
    } else if (isNicknameExist) {
      throw new UnauthorizedException('이미 존재하는 닉네임입니다.');
    } else {
      //Account 저장
      try {
        await this.accountRepository.save(accountAdmin);
      } catch (err) {
        console.log(err);
        return this.convertException.badRequestError('관리자 회원가입에 ', 400);
      }
    }

    const admin = this.adminRepository.create({
      accountId: accountAdmin,
      companyId,
      roleId,
      isSuper,
    });
    try {
      await this.adminRepository.save(admin);
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return '회원가입 완료(관리자)';
  }
}
