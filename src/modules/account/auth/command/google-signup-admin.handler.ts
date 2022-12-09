import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { GoogleSignUpAdminCommand } from './google-signup-admin.command';

/**
 * 구글 (관리자) 2차정보 가입 핸들러
 */
@Injectable()
@CommandHandler(GoogleSignUpAdminCommand)
export class GoogleSignUpAdminHandler implements ICommandHandler<GoogleSignUpAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    @Inject(ConvertException)
    private convertException: ConvertException,
  ) {}

  //구글 2차 정보 저장 메소드
  async execute(command: GoogleSignUpAdminCommand) {
    let {
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    } = command;

    const accountGoogleAdmin = this.accountRepository.create({
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsType: '02',
      snsToken,
      division: true,
    });

    const isIdExist = await this.accountRepository.findOne({ where: { snsId } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
    const isBusinessNumberExist = await this.companyRepository.findOne({
      where: { businessNumber },
    });

    //중복체크
    if (isIdExist) {
      return this.convertException.badInput('이미 존재하는 아이디입니다. ', 400);
    } else if (isPhoneExist) {
      return this.convertException.badInput('이미 존재하는 연락처입니다. ', 400);
    } else if (isNicknameExist) {
      return this.convertException.badInput('이미 존재하는 닉네임입니다. ', 400);
    } else if (isBusinessNumberExist) {
      return this.convertException.badInput('이미 존재하는 사업자번호입니다. ', 400);
    }

    try {
      await this.accountRepository.save(accountGoogleAdmin);
    } catch (err) {
      console.log(err);
      return this.convertException.badRequestError('구글 2차정보 저장에 ', 400);
    }

    //회원가입 시 회원사 테이블 데이터저장
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

    const adminGoogle = this.adminRepository.create({
      accountId: accountGoogleAdmin.accountId,
      //임의값 입력
      companyId: company.companyId,
      roleId: 0,
      isSuper: true,
    });

    try {
      await this.adminRepository.save(adminGoogle);
    } catch (err) {
      console.log(err);
      return this.convertException.CommonError(500);
    }

    // 구글 정보를 리턴
    return accountGoogleAdmin;
  }
}
