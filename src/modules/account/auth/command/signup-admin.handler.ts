import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/modules/account/admin/entities/admin';
import { Account } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';
import { SignUpAdminCommand } from './signup-admin.command';
import { ConvertException } from 'src/common/utils/convert-exception';
import * as bcrypt from 'bcryptjs';
import { Company } from 'src/modules/company/entities/company.entity';

/**
 * 관리자 회원가입 핸들러
 */
@Injectable()
@CommandHandler(SignUpAdminCommand)
export class SignUpAdminHandler implements ICommandHandler<SignUpAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: SignUpAdminCommand) {
    let {
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyName,
      companyCode,
      businessNumber,
    } = command;

    if (gender == 'male') {
      gender = '1';
    } else {
      gender = '0';
    }

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
      division: true,
    });

    //중복체크
    const isIdExist = await this.accountRepository.findOne({ where: { id } });
    const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
    const isBusinessNumberExist = await this.companyRepository.findOne({
      where: { businessNumber },
    });

    if (isIdExist) {
      throw new UnauthorizedException('이미 존재하는 아이디입니다.');
    } else if (isEmailExist) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    } else if (isPhoneExist) {
      throw new UnauthorizedException('이미 존재하는 연락처입니다.');
    } else if (isNicknameExist) {
      throw new UnauthorizedException('이미 존재하는 닉네임입니다.');
    } else if (isBusinessNumberExist) {
      throw new UnauthorizedException('이미 존재하는 사업자번호입니다.');
    }
    {
      //Account 저장
      try {
        await this.accountRepository.save(accountAdmin);
      } catch (err) {
        console.log(err);
        return this.convertException.badRequestError('관리자 회원가입에 ', 400);
      }
    }

    //회원가입 시 회원사 테이블 데이터저장
    const company = this.companyRepository.create({
      companyName,
      companyCode,
      businessNumber,
    });

    // const isBusinessNumberExist = await this.companyRepository.findOne({
    //   where: { businessNumber },
    // });

    // if (isBusinessNumberExist) {
    //   throw new UnauthorizedException('이미 존재하는 사업자번호입니다.');
    // }

    try {
      await this.companyRepository.save(company);
    } catch (err) {
      console.log(err);
      return this.convertException.badRequestError('회원사 정보 가입에', 400);
    }

    const admin = this.adminRepository.create({
      accountId: accountAdmin.accountId,
      companyId: company.companyId,
      roleId: 0,
      isSuper: false, //본사: true, 회원사: false
    });
    try {
      await this.adminRepository.save(admin);
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return '회원가입 완료(관리자)';
  }
}
