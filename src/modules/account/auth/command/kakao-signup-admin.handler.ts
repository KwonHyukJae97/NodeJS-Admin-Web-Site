import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { string } from 'joi';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { DataSource, Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { KakaoSignUpAdminCommand } from './kakao-signup-admin.command';

/**
 * 카카오 (관리자) 2차정보 가입 핸들러
 */
@Injectable()
@CommandHandler(KakaoSignUpAdminCommand)
export class KakaoSignUpAdminHandler implements ICommandHandler<KakaoSignUpAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    @Inject(ConvertException)
    private convertException: ConvertException,

    private dataSource: DataSource,
  ) {}

  //카카오 2차 정보 저장 메소드
  async execute(command: KakaoSignUpAdminCommand) {
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

    //트랜잭션 생성 후 연결 및 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const accountKakaoAdmin = this.accountRepository.create({
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsType: '01',
      snsToken,
      division: true,
    });

    try {
      await queryRunner.manager.getRepository(Account).save(accountKakaoAdmin);

      //회원가입 시 회원사 테이블 데이터저장
      const company = this.companyRepository.create({
        companyName,
        companyCode,
        businessNumber,
      });

      await queryRunner.manager.getRepository(Company).save(company);

      const adminKakao = this.adminRepository.create({
        accountId: accountKakaoAdmin.accountId,
        companyId: company.companyId,
        //임의값 입력
        roleId: 0,
        isSuper: true,
      });

      await queryRunner.manager.getRepository(Admin).save(adminKakao);

      await queryRunner.commitTransaction();

      return accountKakaoAdmin;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('카카오 2차정보 저장에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
