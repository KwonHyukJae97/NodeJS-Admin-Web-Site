/* eslint-disable prefer-const */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/modules/account/admin/entities/admin.entity';
import { Account } from 'src/modules/account/entities/account.entity';
import { DataSource, Repository } from 'typeorm';
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
    private dataSource: DataSource,
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

    //중복체크
    const isIdExist = await this.accountRepository.findOne({ where: { id } });
    const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
    const isCompanyNameExist = await this.companyRepository.findOne({
      where: { companyName },
    });

    if (isIdExist) {
      return this.convertException.badInput('이미 존재하는 아이디입니다. ', 400);
    } else if (isEmailExist) {
      return this.convertException.badInput('이미 존재하는 이메일입니다. ', 400);
    } else if (isPhoneExist) {
      return this.convertException.badInput('이미 존재하는 연락처입니다. ', 400);
    } else if (isNicknameExist) {
      return this.convertException.badInput('이미 존재하는 닉네임입니다. ', 400);
    } else if (isCompanyNameExist) {
      // 회원사 데이터가 존재할 경우 저장된 사업자 번호 일치 여부 체크
      if (isCompanyNameExist.businessNumber !== businessNumber) {
        return this.convertException.badRequestError('사업자번호에 ', 400);
      }
    }

    //트랜잭션 생성 후 연결 및 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
      console.log('어카운트 회원가입 데이터', accountAdmin.accountId);
      //Account 저장
      await queryRunner.manager.getRepository(Account).save(accountAdmin);

      // 회원사 이름이 존재하지 않을 경우 회원사 데이터 새로 생성
      if (!isCompanyNameExist) {
        const company = this.companyRepository.create({
          companyName,
          companyCode,
          businessNumber,
        });
        await queryRunner.manager.getRepository(Company).save(company);

        // 관리자 데이터 생성
        const admin = this.adminRepository.create({
          accountId: accountAdmin.accountId,
          companyId: company.companyId,
          roleId: 0,
          isSuper: false, //본사: true, 회원사: false
        });
        await queryRunner.manager.getRepository(Admin).save(admin);
      } else {
        // 회원사 이름이 존재할 경우 관리자 데이터만 생성
        const admin = this.adminRepository.create({
          accountId: accountAdmin.accountId,
          companyId: isCompanyNameExist.companyId,
          roleId: 0,
          isSuper: false, //본사: true, 회원사: false
        });
        await queryRunner.manager.getRepository(Admin).save(admin);
      }
      await queryRunner.commitTransaction();
      return '회원가입 완료(관리자)';
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('관리자 회원가입에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
