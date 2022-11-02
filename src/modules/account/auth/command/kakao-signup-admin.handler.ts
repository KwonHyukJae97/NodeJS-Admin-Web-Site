import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { Repository } from 'typeorm';
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
  ) {}

  //카카오 2차 정보 저장 메소드
  async execute(command: KakaoSignUpAdminCommand) {
    let { name, phone, nickname, birth, gender, snsId, snsToken, companyName, companyCode } =
      command;
    console.log('kakao command', command.snsToken);

    //카카오에서 넘어오는 성별 값을 account 형식에 맞게 변경하여 저장
    if (gender == 'male') {
      gender = '1';
    } else {
      gender = '0';
    }

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

    //중복체크
    const isIdExist = await this.accountRepository.findOne({ where: { snsId } });
    const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });

    if (isIdExist) {
      return this.convertException.badRequestAccountError(
        '이미 존재하는 카카오 아이디이므로 저장에',
        400,
      );
    } else if (isPhoneExist) {
      return this.convertException.badRequestAccountError('이미 존재하는 연락처이므로 저장에', 400);
    } else if (isNicknameExist) {
      return this.convertException.badRequestAccountError('이미 존재하는 닉네임이므로 저장에', 400);
    } else {
      try {
        await this.accountRepository.save(accountKakaoAdmin);
      } catch (err) {
        console.log(err);
        return this.convertException.badRequestError('Kakao 2차정보 저장에', 400);
      }
    }

    //회원가입 시 회원사 테이블 데이터저장
    const company = this.companyRepository.create({
      companyName,
      companyCode,
    });
    try {
      await this.companyRepository.save(company);
    } catch (err) {
      console.log(err);
      return this.convertException.badRequestError('회원사 정보 가입에', 400);
    }

    const adminKakao = this.adminRepository.create({
      accountId: accountKakaoAdmin.accountId,
      companyId: 0,
      roleId: 0,
      isSuper: true,
    });

    try {
      await this.adminRepository.save(adminKakao);
    } catch (err) {
      console.log(err);
      return this.convertException.CommonError(500);
    }

    // 카카오 정보를 리턴
    return accountKakaoAdmin;
  }
}
