import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { Admin } from '../entities/admin';
import { CreateAdminCommand } from './create-admin.command';
import * as bcrypt from 'bcryptjs';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';

/**
 * 관리자 정보 등록 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateAdminCommand)
export class CreateAdminhandler implements ICommandHandler<CreateAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: CreateAdminCommand) {
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

    const isIdExist = await this.accountRepository.findOne({ where: { id } });
    const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
    const isBusinessNumberExist = await this.companyRepository.findOne({
      where: { businessNumber },
    });

    if (isIdExist) {
      return this.convertException.badInput('이미 존재하는 아이디입니다. ', 400);
    } else if (isEmailExist) {
      return this.convertException.badInput('이미 존재하는 이메일입니다. ', 400);
    } else if (isPhoneExist) {
      return this.convertException.badInput('이미 존재하는 연락처입니다. ', 400);
    } else if (isNicknameExist) {
      return this.convertException.badInput('이미 존재하는 닉네임입니다. ', 400);
    } else if (isBusinessNumberExist) {
      return this.convertException.badInput('이미 존재하는 사업자번호입니다. ', 400);
    }
    {
      try {
        await this.accountRepository.save(accountAdmin);
      } catch (err) {
        return this.convertException.badRequestError('관리자 정보 등록에', 400);
      }
    }

    const company = this.companyRepository.create({
      companyName,
      companyCode,
      businessNumber,
    });

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

    return '관리자 등록 완료';
  }
}
