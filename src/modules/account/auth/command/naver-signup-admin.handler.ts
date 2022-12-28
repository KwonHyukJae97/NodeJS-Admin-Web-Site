import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { DataSource, Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { NaverSignUpAdminCommand } from './naver-signup-admin.command';

/**
 * 네이버 (관리자) 2차정보 가입 핸들러
 */
@Injectable()
@CommandHandler(NaverSignUpAdminCommand)
export class NaverSignUpAdminHandler implements ICommandHandler<NaverSignUpAdminCommand> {
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

  //네이버 2차 정보 저장 메소드
  async execute(command: NaverSignUpAdminCommand) {
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

    //중복체크
    const isIdExist = await this.accountRepository.findOne({ where: { snsId } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
    const isBusinessNumberExist = await this.companyRepository.findOne({
      where: { businessNumber },
    });

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

    try {
      const accountNaverAdmin = this.accountRepository.create({
        name,
        phone,
        nickname,
        birth,
        gender,
        snsId,
        snsType: '00',
        snsToken,
        division: true,
      });

      await queryRunner.manager.getRepository(Account).save(accountNaverAdmin);

      //회원가입 시 회원사 테이블 데이터저장
      const company = this.companyRepository.create({
        companyName,
        companyCode,
        businessNumber,
      });

      await queryRunner.manager.getRepository(Company).save(company);

      const adminNaver = this.adminRepository.create({
        accountId: accountNaverAdmin.accountId,
        companyId: company.companyId,
        //임의값 입력
        roleId: 0,
        isSuper: true,
      });

      await queryRunner.manager.getRepository(Admin).save(adminNaver);

      await queryRunner.commitTransaction();

      return accountNaverAdmin;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('네이버 2차정보 저장에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
