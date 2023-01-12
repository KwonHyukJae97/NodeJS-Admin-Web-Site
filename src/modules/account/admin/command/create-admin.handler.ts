/* eslint-disable prefer-const */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Admin } from '../entities/admin.entity';
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

    private dataSource: DataSource,
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
      // 계정 데이터 생성
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
      return '관리자 등록 완료';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('관리자 정보 등록에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
