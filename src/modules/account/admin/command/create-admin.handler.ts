import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

    //트랜잭션 생성 후 연결 및 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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

    {
      try {
        await queryRunner.manager.getRepository(Account).save(accountAdmin);

        const company = this.companyRepository.create({
          companyName,
          companyCode,
          businessNumber,
        });

        await queryRunner.manager.getRepository(Company).save(company);

        const admin = this.adminRepository.create({
          accountId: accountAdmin.accountId,
          companyId: company.companyId,
          roleId: 0,
          isSuper: false, //본사: true, 회원사: false
        });

        await queryRunner.manager.getRepository(Admin).save(admin);
        await queryRunner.commitTransaction();
        return '관리자 등록 완료';
      } catch (err) {
        await queryRunner.rollbackTransaction();
        return this.convertException.badRequestError('관리자 정보 등록에', 400);
      } finally {
        await queryRunner.release();
      }
    }
  }
}
